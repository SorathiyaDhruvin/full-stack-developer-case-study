const {
    createStockMovement,
    getAllStockMovements,
    getStockMovementsByProduct
} = require("../models/stockModel");

const { pool } = require("../config/db");

// Create stock movement
const addStockMovement = async (req, res, next) => {
    const connection = await pool.getConnection();

    try {
        const {
            product_id,
            quantity,
            movement_type,
            reason
        } = req.body;

        // Basic validation
        if (!product_id || !quantity || !movement_type || !reason) {
            return res.status(400).json({
                success: false,
                message: "Product, quantity, movement type and reason are required"
            });
        }

        // Validate quantity
        if (Number(quantity) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than 0"
            });
        }

        // Validate movement type
        if (!["IN", "OUT"].includes(movement_type)) {
            return res.status(400).json({
                success: false,
                message: "Movement type must be IN or OUT"
            });
        }

        // Check product
        const [products] = await connection.query(
            `SELECT id, product_name, current_stock
             FROM products
             WHERE id = ?`,
            [product_id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const product = products[0];

        // Prevent negative stock
        if (
            movement_type === "OUT" &&
            product.current_stock < Number(quantity)
        ) {
            return res.status(400).json({
                success: false,
                message: "Insufficient stock"
            });
        }

        await connection.beginTransaction();

        // Calculate new stock
        let newStock;

        if (movement_type === "IN") {
            newStock = product.current_stock + Number(quantity);
        } else {
            newStock = product.current_stock - Number(quantity);
        }

        // Update product stock
        await connection.query(
            `UPDATE products
             SET current_stock = ?
             WHERE id = ?`,
            [newStock, product_id]
        );

        // Create movement log
        await connection.query(
            `INSERT INTO stock_movements
            (
                product_id,
                quantity,
                movement_type,
                reason,
                created_by
            )
            VALUES (?, ?, ?, ?, ?)`,
            [
                product_id,
                quantity,
                movement_type,
                reason,
                req.user.id
            ]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Stock movement created successfully",
            stock: newStock
        });

    } catch (error) {
        await connection.rollback();
        next(error);

    } finally {
        connection.release();
    }
};

// Get all stock movements
const getStockMovements = async (req, res, next) => {
    try {
        const movements = await getAllStockMovements();

        res.status(200).json({
            success: true,
            count: movements.length,
            movements
        });

    } catch (error) {
        next(error);
    }
};

// Get stock movements by product
const getProductStockMovements = async (req, res, next) => {
    try {
        const { productId } = req.params;

        const movements = await getStockMovementsByProduct(productId);

        res.status(200).json({
            success: true,
            count: movements.length,
            movements
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    addStockMovement,
    getStockMovements,
    getProductStockMovements
};