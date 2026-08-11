const { pool } = require("../config/db");

// Create product
const createProduct = async (productData) => {
    const {
        product_name,
        sku,
        category,
        unit_price,
        current_stock,
        minimum_stock,
        warehouse_location
    } = productData;

    const [result] = await pool.query(
        `INSERT INTO products
        (
            product_name,
            sku,
            category,
            unit_price,
            current_stock,
            minimum_stock,
            warehouse_location
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            product_name,
            sku,
            category,
            unit_price,
            current_stock,
            minimum_stock,
            warehouse_location
        ]
    );

    return result;
};

// Get all products
const getAllProducts = async () => {
    const [rows] = await pool.query(
        `SELECT *
         FROM products
         ORDER BY created_at DESC`
    );

    return rows;
};

// Get product by ID
const getProductById = async (id) => {
    const [rows] = await pool.query(
        `SELECT *
         FROM products
         WHERE id = ?`,
        [id]
    );

    return rows[0];
};

// Update product
const updateProduct = async (id, productData) => {
    const {
        product_name,
        sku,
        category,
        unit_price,
        current_stock,
        minimum_stock,
        warehouse_location
    } = productData;

    const [result] = await pool.query(
        `UPDATE products
         SET
            product_name = ?,
            sku = ?,
            category = ?,
            unit_price = ?,
            current_stock = ?,
            minimum_stock = ?,
            warehouse_location = ?
         WHERE id = ?`,
        [
            product_name,
            sku,
            category,
            unit_price,
            current_stock,
            minimum_stock,
            warehouse_location,
            id
        ]
    );

    return result;
};

// Delete product
const deleteProduct = async (id) => {
    const [result] = await pool.query(
        `DELETE FROM products
         WHERE id = ?`,
        [id]
    );

    return result;
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
};