const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../config/database').sequelize;

const Exoplanet = sequelize.define('Exoplanet', {
  name: { type: DataTypes.STRING, allowNull: false },
  ra: { type: DataTypes.FLOAT, allowNull: false },
  dec: { type: DataTypes.FLOAT, allowNull: false },
  radius: { type: DataTypes.FLOAT, allowNull: false },
  mass: { type: DataTypes.FLOAT, allowNull: true },
}, {
  tableName: 'exoplanets',
  timestamps: true,
});

module.exports = Exoplanet;