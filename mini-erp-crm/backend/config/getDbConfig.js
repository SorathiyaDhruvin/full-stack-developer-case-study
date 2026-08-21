require('dotenv').config();

function getDbConfig() {
    if (process.env.DATABASE_URL) {
        // Parse the URL to handle Aiven's ssl-mode=REQUIRED
        // because mysql2 doesn't understand ssl-mode=REQUIRED directly
        let uri = process.env.DATABASE_URL;
        
        // Remove ssl-mode=REQUIRED to prevent the mysql2 warning
        uri = uri.replace('?ssl-mode=REQUIRED', '');
        
        return {
            uri: uri,
            ssl: {
                rejectUnauthorized: false // Required for Aiven if we don't have the specific CA cert downloaded
            },
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            multipleStatements: true // For init_db.js
        };
    }
    
    // Fallback to local config
    return {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        multipleStatements: true
    };
}

module.exports = getDbConfig;
