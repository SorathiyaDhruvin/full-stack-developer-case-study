const mysql = require("mysql2/promise");
require("dotenv").config();

const getDbConfig = require("./getDbConfig");

const pool = mysql.createPool(getDbConfig());

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