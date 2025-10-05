require('dotenv').config();

const env = {
  PORT: process.env.PORT || 3000,
  POSTGRES_URL: process.env.POSTGRES_URL,
  MONGO_URL: process.env.MONGO_URL,
  JWT_SECRET: process.env.JWT_SECRET,
};

module.exports = env;