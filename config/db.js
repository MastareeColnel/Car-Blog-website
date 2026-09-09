// Load environment variables from .env
require('dotenv').config();

const { Pool } = require('pg');

// Create a PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Log unexpected pool-level errors
pool.on('error', (error) => {
    console.error('Unexpected PostgreSQL pool error:', error.message);
});

// Export the pool so other files can use the database
module.exports = pool;