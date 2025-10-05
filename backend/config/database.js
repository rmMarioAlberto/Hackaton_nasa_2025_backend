// backend/config/database.js
const { neon } = require('@neondatabase/serverless');
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

const sql = neon(POSTGRES_URL);

const connectPostgres = async () => {
  try {
    const result = await sql`SELECT version()`;
    console.log('PostgreSQL connected:', result[0].version);
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

module.exports = { sql, connectPostgres, connectMongo };