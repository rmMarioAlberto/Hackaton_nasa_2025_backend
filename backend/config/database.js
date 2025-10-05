const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const sequelize = new Sequelize(process.env.POSTGRES_URL, {
  dialect: 'postgres',
  logging: false,
});

const connectPostgres = async () => {
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

module.exports = { sequelize, connectPostgres, connectMongo };