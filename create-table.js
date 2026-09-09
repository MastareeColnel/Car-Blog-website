// Load environment variables
require('dotenv').config();

const pool = require('./config/db');

async function createArticlesTable() {
    try {
        // Remove the old table because it is currently empty
        await pool.query(`
            DROP TABLE IF EXISTS articles;
        `);

        // Create the table using BIGINT for our large article IDs
        await pool.query(`
            CREATE TABLE articles (
                id BIGINT PRIMARY KEY,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                content TEXT NOT NULL,
                date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP
            );
        `);

        console.log('Articles table created successfully!');
    } catch (error) {
        console.error('Failed to create articles table:', error.message);
    } finally {
        await pool.end();
    }
}

createArticlesTable();