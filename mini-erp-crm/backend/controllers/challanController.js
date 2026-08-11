const { pool } = require("../config/db");

const {
    createChallan,
    createChallanItem,
    getAllChallans,
    getChallanById,
    updateChallanStatus
} = require("../models/challanModel");

// Generate challan number
const generateChallanNumber = async (connection) => {
    const [rows] = await connection.query(
        `SELECT COUNT(*) AS total
         FROM challans`
    );

    const nextNumber = rows[0].total + 1;

    return `CH-${String(nextNumber).padStart(6, "0")}`;
};

// Create challan
const addChallan = async (req, res, next) => {
    const connection = await pool.getConnection();

    try {
        const {
            customer_id,
            status,
            items
        } = req.body;

        // Basic validation
        if (!customer_id || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Customer and at least one product are required"
            });
        }

        // Validate status
        const allowedStatuses = [
            "Draft",
            "Confirmed"
        ];

        const challanStatus = status || "Draft";

        if (!allowedStatuses.includes(challanStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid challan status"
            });
        }

        // Check customer
        const [customers] = await connection.query(
            `SELECT id, customer_name
             FROM customers
             WHERE id = ?`,
            [customer_id]
        );

        if (customers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        await connection.beginTransaction();

        let totalQuantity = 0;
        const validatedItems = [];

        // Validate every product
        for (const item of items) {
            const {
                product_id,
                quantity
            } = item;

            if (!product_id || !quantity || Number(quantity) <= 0) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: "Each product must have a valid product ID and quantity"
                });
            }

            const [products] = await connection.query(
                `SELECT
                    id,
                    product_name,
                    sku,
                    unit_price,
                    current_stock
                 FROM products
                 WHERE id = ?`,
                [product_id]
            );

            if (products.length === 0) {
                await connection.rollback();

                return res.status(404).json({
                    success: false,
                    message: `Product with ID ${product_id} not found`
                });
            }

            const product = products[0];

            // Confirmed challan must have enough stock
            if (
                challanStatus === "Confirmed" &&
                product.current_stock < Number(quantity)
            ) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.product_name}`
                });
            }

            totalQuantity += Number(quantity);

            validatedItems.push({
                product_id: product.id,
                product_name: product.product_name,
                sku: product.sku,
                unit_price: product.unit_price,
                quantity: Number(quantity)
            });
        }

        // Generate challan number
        const challanNumber = await generateChallanNumber(connection);

        // Create challan
        const [challanResult] = await connection.query(
            `INSERT INTO challans
            (
                challan_number,
                customer_id,
                total_quantity,
                status,
                created_by
            )
            VALUES (?, ?, ?, ?, ?)`,
            [
                challanNumber,
                customer_id,
                totalQuantity,
                challanStatus,
                req.user.id
            ]
        );

        const challanId = challanResult.insertId;

        // Create challan items
        for (const item of validatedItems) {
            await connection.query(
                `INSERT INTO challan_items
                (
                    challan_id,
                    product_id,
                    product_name,
                    sku,
                    unit_price,
                    quantity
                )
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    challanId,
                    item.product_id,
                    item.product_name,
                    item.sku,
                    item.unit_price,
                    item.quantity
                ]
            );

            // Reduce stock only for confirmed challan
            if (challanStatus === "Confirmed") {

                await connection.query(
                    `UPDATE products
                     SET current_stock = current_stock - ?
                     WHERE id = ?`,
                    [
                        item.quantity,
                        item.product_id
                    ]
                );

                // Create stock movement
                await connection.query(
                    `INSERT INTO stock_movements
                    (
                        product_id,
                        quantity,
                        movement_type,
                        reason,
                        created_by
                    )
                    VALUES (?, ?, 'OUT', ?, ?)`,
                    [
                        item.product_id,
                        item.quantity,
                        `Sales Challan ${challanNumber}`,
                        req.user.id
                    ]
                );
            }
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Challan created successfully",
            challan: {
                id: challanId,
                challan_number: challanNumber,
                customer_id,
                total_quantity: totalQuantity,
                status: challanStatus
            }
        });

    } catch (error) {
        await connection.rollback();
        next(error);

    } finally {
        connection.release();
    }
};

// Get all challans
const getChallans = async (req, res, next) => {
    try {
        const challans = await getAllChallans();

        res.status(200).json({
            success: true,
            count: challans.length,
            challans
        });

    } catch (error) {
        next(error);
    }
};

// Get challan by ID
const getChallan = async (req, res, next) => {
    try {
        const { id } = req.params;

        const challan = await getChallanById(id);

        if (!challan) {
            return res.status(404).json({
                success: false,
                message: "Challan not found"
            });
        }

        res.status(200).json({
            success: true,
            challan
        });

    } catch (error) {
        next(error);
    }
};

const changeChallanStatus = async (req, res, next) => {
    const connection = await pool.getConnection();

    try {
        const { id } = req.params;
        const { status } = req.body;

        // Only Confirmed or Cancelled can be set here
        if (!["Confirmed", "Cancelled"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid challan status"
            });
        }

        // Get existing challan
        const challan = await getChallanById(id);

        if (!challan) {
            return res.status(404).json({
                success: false,
                message: "Challan not found"
            });
        }

        // Already confirmed
        if (challan.status === "Confirmed") {
            return res.status(400).json({
                success: false,
                message: "Challan is already confirmed"
            });
        }

        // Cancel challan
        if (status === "Cancelled") {
            await updateChallanStatus(id, "Cancelled");

            return res.status(200).json({
                success: true,
                message: "Challan cancelled successfully"
            });
        }

        // ================= CONFIRM CHALLAN =================

        await connection.beginTransaction();

        // First check stock for ALL items
        for (const item of challan.items) {

            const [products] = await connection.query(
                `SELECT id, product_name, current_stock
                 FROM products
                 WHERE id = ?
                 FOR UPDATE`,
                [item.product_id]
            );

            if (products.length === 0) {
                await connection.rollback();

                return res.status(404).json({
                    success: false,
                    message: `Product ${item.product_id} not found`
                });
            }

            const product = products[0];

            if (product.current_stock < item.quantity) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.product_name}`
                });
            }
        }

        // Reduce stock + create OUT movement
        for (const item of challan.items) {

            await connection.query(
                `UPDATE products
                 SET current_stock = current_stock - ?
                 WHERE id = ?`,
                [
                    item.quantity,
                    item.product_id
                ]
            );

            await connection.query(
                `INSERT INTO stock_movements
                (
                    product_id,
                    quantity,
                    movement_type,
                    reason,
                    created_by
                )
                VALUES (?, ?, 'OUT', ?, ?)`,
                [
                    item.product_id,
                    item.quantity,
                    `Sales Challan ${challan.challan_number}`,
                    req.user.id
                ]
            );
        }

        // Finally mark challan as confirmed
        await connection.query(
            `UPDATE challans
             SET status = 'Confirmed'
             WHERE id = ?`,
            [id]
        );

        await connection.commit();

        res.status(200).json({
            success: true,
            message: "Challan confirmed and stock updated successfully"
        });

    } catch (error) {

        await connection.rollback();
        next(error);

    } finally {

        connection.release();
    }
};

module.exports = {
    addChallan,
    getChallans,
    getChallan,
    changeChallanStatus
};