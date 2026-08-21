const fs = require('fs');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

async function initDB() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            multipleStatements: true
        });

        const schema = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8');
        
        console.log("Executing schema...");
        await pool.query(schema);
        console.log("Database initialized successfully!");
        
        // Also check if any user exists
        const [users] = await pool.query("SELECT * FROM mini_erp_crm.users");
        console.log("Users count:", users.length);
        
        process.exit(0);
    } catch (error) {
        console.error("Error initializing DB:", error);
        process.exit(1);
    }
}

initDB();
