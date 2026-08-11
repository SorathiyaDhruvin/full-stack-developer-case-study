const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function testConnection() {
    try {
        const[rows]= await pool.query("SELECT DATABASE() AS database_name");
        console.log("Congratulation, MySQL connected successfully!!");
        console.log("Database:",rows[0].database_name);
    } catch (error) {
        console.error("MySQL connection failed:", error.message);
    }
}

module.exports = {
    pool,
    testConnection
};