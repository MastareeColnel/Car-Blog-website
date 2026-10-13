
const pool = require('./config/db');

// Read the table names from Neon without modifying the database
pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
`)
    .then((result) => {
        console.log('Tables in Neon:');
        console.table(result.rows);
    })
    .catch((error) => {
        console.error('Database check failed:', error.message);
        process.exitCode = 1;
    })
    .finally(() => {
        // Close the database connection pool
        return pool.end();
    });
