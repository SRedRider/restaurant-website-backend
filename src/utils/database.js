const mysql = require('mysql2');
require('dotenv').config();

// Ensure that you are using promisePool correctly
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, // You can adjust this number based on your needs
    queueLimit: 0
});

// Use the promise interface
const promisePool = pool.promise();

module.exports = promisePool;


