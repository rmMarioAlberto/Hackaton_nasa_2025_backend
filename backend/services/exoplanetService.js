const Exoplanet = require('../models/postgres/Exoplanet');

const getAllExoplanets = async () => {
  return await Exoplanet.findAll();
};

const createExoplanet = async (data) => {
  return await Exoplanet.create(data);
};

module.exports = { getAllExoplanets, createExoplanet };