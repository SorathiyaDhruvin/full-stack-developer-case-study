const { pool } = require("../config/db");

// Create stock movement
const createStockMovement = async (movementData) => {
    const {
        product_id,
        quantity,
        movement_type,
        reason,
        created_by
    } = movementData;

    const [result] = await pool.query(
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
            created_by
        ]
    );

    return result;
};

// Get all stock movements
const getAllStockMovements = async () => {
    const [rows] = await pool.query(
        `SELECT
            sm.id,
            sm.product_id,
            p.product_name,
            p.sku,
            sm.quantity,
            sm.movement_type,
            sm.reason,
            sm.created_by,
            u.name AS created_by_name,
            sm.created_at
         FROM stock_movements sm
         JOIN products p ON sm.product_id = p.id
         JOIN users u ON sm.created_by = u.id
         ORDER BY sm.created_at DESC`
    );

    return rows;
};

// Get stock movements for one product
const getStockMovementsByProduct = async (productId) => {
    const [rows] = await pool.query(
        `SELECT
            sm.id,
            sm.product_id,
            p.product_name,
            p.sku,
            sm.quantity,
            sm.movement_type,
            sm.reason,
            sm.created_by,
            u.name AS created_by_name,
            sm.created_at
         FROM stock_movements sm
         JOIN products p ON sm.product_id = p.id
         JOIN users u ON sm.created_by = u.id
         WHERE sm.product_id = ?
         ORDER BY sm.created_at DESC`,
        [productId]
    );

    return rows;
};

module.exports = {
    createStockMovement,
    getAllStockMovements,
    getStockMovementsByProduct
};