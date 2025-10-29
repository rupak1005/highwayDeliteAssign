const { Pool } = require('pg');
require('dotenv').config({ path: './config.env' });

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('neon.tech') ? {
        rejectUnauthorized: false,
      } : undefined,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      statement_timeout: 30000,
      query_timeout: 30000,
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'bookit_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to database');
    client.release();
    return true;
  } catch (err) {
    console.error('Database connection failed:', err.message);
    return false;
  }
};

pool.on('error', (err) => {
  console.error('Database error:', err);
});

module.exports = { pool, testConnection };

