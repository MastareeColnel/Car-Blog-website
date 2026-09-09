// Load environment variables
require('dotenv').config();

const pool = require('./config/db');

async function checkArticlesTable() {
    try {
        const result = await pool.query('SELECT * FROM articles');

        console.log('Articles currently in database:');
        console.table(result.rows);
    } catch (error) {
        console.error('Failed to read articles table:', error.message);
    } finally {
        await pool.end();
    }
}

checkArticlesTable();