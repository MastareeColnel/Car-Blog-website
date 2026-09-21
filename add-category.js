// Load environment variables
require('dotenv').config();

const pool = require('./config/db');

async function addCategoryColumn() {
    try {
        // Add the category column if it does not already exist
        await pool.query(`
            ALTER TABLE articles
            ADD COLUMN IF NOT EXISTS category VARCHAR(100);
        `);

        console.log('Category column added successfully.');
    } catch (error) {
        console.error('Error adding category column:', error.message);
    } finally {
        // Close the database connection
        await pool.end();
    }
}

addCategoryColumn();