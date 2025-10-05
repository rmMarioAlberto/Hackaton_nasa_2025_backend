const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');
require('dotenv').config();

const connectPostgres = async () => {
  const sequelize = new Sequelize(process.env.POSTGRES_URL, {
    dialect: 'postgres',
  });
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connected');
  } catch (error) {
    console.error('PostgreSQL connection error:', error);
  }
};

const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

module.exports = { connectPostgres, connectMongo };