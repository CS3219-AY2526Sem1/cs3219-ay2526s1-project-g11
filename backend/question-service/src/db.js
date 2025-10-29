const { Pool } = require('pg');

let pool;

const connectDB = async () => {
    try {
        if (!process.env.POSTGRES_URL) {
            throw new Error('POSTGRES_URL env var is not set');
        }
        if (!pool) {
            pool = new Pool({
                connectionString: process.env.POSTGRES_URL,
                // ssl: { rejectUnauthorized: false }, // enable if required by your DB
            });
            // Simple connectivity check
            await pool.query('SELECT 1');
            console.log('PostgreSQL Connected');
        }
        return pool;
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

// Helper to get a pooled client or run a query directly
const getPool = () => {
    if (!pool) throw new Error('DB not initialized. Call connectDB() first.');
    return pool;
};

module.exports = { connectDB, getPool };