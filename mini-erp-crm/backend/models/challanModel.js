const { pool } = require("../config/db");

// Create challan
const createChallan = async (challanData) => {
    const {
        challan_number,
        customer_id,
        total_quantity,
        status,
        created_by
    } = challanData;

    const [result] = await pool.query(
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
            challan_number,
            customer_id,
            total_quantity,
            status,
            created_by
        ]
    );

    return result;
};

// Add product to challan
const createChallanItem = async (itemData) => {
    const {
        challan_id,
        product_id,
        product_name,
        sku,
        unit_price,
        quantity
    } = itemData;

    const [result] = await pool.query(
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
            challan_id,
            product_id,
            product_name,
            sku,
            unit_price,
            quantity
        ]
    );

    return result;
};

// Get all challans
const getAllChallans = async () => {
    const [rows] = await pool.query(
        `SELECT
            c.id,
            c.challan_number,
            c.customer_id,
            cu.customer_name,
            c.total_quantity,
            c.status,
            c.created_by,
            u.name AS created_by_name,
            c.created_at
         FROM challans c
         JOIN customers cu ON c.customer_id = cu.id
         JOIN users u ON c.created_by = u.id
         ORDER BY c.created_at DESC`
    );

    return rows;
};

// Get one challan
const getChallanById = async (id) => {
    const [challans] = await pool.query(
        `SELECT
            c.id,
            c.challan_number,
            c.customer_id,
            cu.customer_name,
            c.total_quantity,
            c.status,
            c.created_by,
            u.name AS created_by_name,
            c.created_at
         FROM challans c
         JOIN customers cu ON c.customer_id = cu.id
         JOIN users u ON c.created_by = u.id
         WHERE c.id = ?`,
        [id]
    );

    if (challans.length === 0) {
        return null;
    }

    const [items] = await pool.query(
        `SELECT
            id,
            challan_id,
            product_id,
            product_name,
            sku,
            unit_price,
            quantity
         FROM challan_items
         WHERE challan_id = ?`,
        [id]
    );

    return {
        ...challans[0],
        items
    };
};

// Update challan status
const updateChallanStatus = async (id, status) => {
    const [result] = await pool.query(
        `UPDATE challans
         SET status = ?
         WHERE id = ?`,
        [status, id]
    );

    return result;
};

module.exports = {
    createChallan,
    createChallanItem,
    getAllChallans,
    getChallanById,
    updateChallanStatus
};