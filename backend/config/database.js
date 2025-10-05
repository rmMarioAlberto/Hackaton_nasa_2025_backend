// backend/config/database.js
const { Pool } = require('pg');
const mongoose = require('mongoose');
const { POSTGRES_URL, MONGO_URL } = require('./env');

console.log('POSTGRES_URL:', POSTGRES_URL); // Debug
console.log('MONGO_URL:', MONGO_URL); // Debug

if (!POSTGRES_URL) {
  throw new Error('POSTGRES_URL is undefined. Check .env file.');
}
if (!MONGO_URL) {
  throw new Error('MONGO_URL is undefined. Check .env file.');
}

const pool = new Pool({
  connectionString: POSTGRES_URL.replace('&channel_binding=require', ''), // Remove channel_binding
  ssl: {
    require: true,
    rejectUnauthorized: false, // Neon compatibility
  },
  max: 20, // Increase pool size for Neon
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 2000, // Timeout after 2s
});

const connectPostgres = async () => {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL connected');
    client.release();
  } catch (error) {
    console.error('PostgreSQL connection error:', error.message);
    throw error;
  }
};

const connectMongo = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

module.exports = { pool, connectPostgres, connectMongo };