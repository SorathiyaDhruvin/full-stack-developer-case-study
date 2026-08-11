const { pool } = require("../config/db");

const createUser = async (name, email, password, role) => {
    const [result] = await pool.query(
        `INSERT INTO users 
        (name, email, password, role)
        VALUES (?, ?, ?, ?)`,
        [name, email, password, role]
    );

    return result;
};

const findUserByEmail = async (email) => {
    const [rows] = await pool.query(
        `SELECT id, name, email, password, role
         FROM users
         WHERE email = ?`,
        [email]
    );

    return rows[0];
};

const findUserById = async (id) => {
    const [rows] = await pool.query(
        `SELECT id, name, email, role, created_at
         FROM users
         WHERE id = ?`,
        [id]
    );

    return rows[0];
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById
};