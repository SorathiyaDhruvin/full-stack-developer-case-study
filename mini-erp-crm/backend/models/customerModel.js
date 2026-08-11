const { pool } = require("../config/db");

// Create customer
const createCustomer = async (customerData) => {
    const {
        customer_name,
        mobile,
        email,
        business_name,
        gst_number,
        customer_type,
        address,
        status,
        follow_up_date,
        notes
    } = customerData;

    const [result] = await pool.query(
        `INSERT INTO customers
        (
            customer_name,
            mobile,
            email,
            business_name,
            gst_number,
            customer_type,
            address,
            status,
            follow_up_date,
            notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            customer_name,
            mobile,
            email,
            business_name,
            gst_number,
            customer_type,
            address,
            status,
            follow_up_date,
            notes
        ]
    );

    return result;
};

// Get all customers
const getAllCustomers = async () => {
    const [rows] = await pool.query(
        `SELECT *
         FROM customers
         ORDER BY created_at DESC`
    );

    return rows;
};

// Get customer by ID
const getCustomerById = async (id) => {
    const [rows] = await pool.query(
        `SELECT *
         FROM customers
         WHERE id = ?`,
        [id]
    );

    return rows[0];
};

// Update customer
const updateCustomer = async (id, customerData) => {
    const {
        customer_name,
        mobile,
        email,
        business_name,
        gst_number,
        customer_type,
        address,
        status,
        follow_up_date,
        notes
    } = customerData;

    const [result] = await pool.query(
        `UPDATE customers
         SET
            customer_name = ?,
            mobile = ?,
            email = ?,
            business_name = ?,
            gst_number = ?,
            customer_type = ?,
            address = ?,
            status = ?,
            follow_up_date = ?,
            notes = ?
         WHERE id = ?`,
        [
            customer_name,
            mobile,
            email,
            business_name,
            gst_number,
            customer_type,
            address,
            status,
            follow_up_date,
            notes,
            id
        ]
    );

    return result;
};

// Delete customer
const deleteCustomer = async (id) => {
    const [result] = await pool.query(
        `DELETE FROM customers
         WHERE id = ?`,
        [id]
    );

    return result;
};

const searchCustomers = async (search) => {
    const [rows] = await pool.query(
        `SELECT *
         FROM customers
         WHERE customer_name LIKE ?
            OR mobile LIKE ?
            OR email LIKE ?
         ORDER BY created_at DESC`,
        [
            `%${search}%`,
            `%${search}%`,
            `%${search}%`
        ]
    );

    return rows;
};

module.exports = {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    searchCustomers
};