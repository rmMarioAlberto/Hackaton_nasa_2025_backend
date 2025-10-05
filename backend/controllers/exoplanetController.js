const exoplanetService = require('../services/exoplanetService');

const getAllExoplanets = async (req, res) => {
  try {
    const exoplanets = await exoplanetService.getAllExoplanets();
    res.json(exoplanets);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching exoplanets' });
  }
};

const createExoplanet = async (req, res) => {
  try {
    const exoplanet = await exoplanetService.createExoplanet(req.body);
    res.status(201).json(exoplanet);
  } catch (error) {
    res.status(500).json({ error: 'Error creating exoplanet' });
  }
};

const importCSV = async (req, res) => {
  try {
    // Placeholder for CSV import logic
    res.json({ message: 'CSV import not implemented yet' });
  } catch (error) {
    res.status(500).json({ error: 'Error importing CSV' });
  }
};

module.exports = { getAllExoplanets, createExoplanet, importCSV };