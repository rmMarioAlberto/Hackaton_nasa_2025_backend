const express = require('express');
const router = express.Router();
const exoplanetController = require('../controllers/exoplanetController');
const auth = require('../middlewares/auth');

// Rutas protegidas para científicos
router.get('/', auth, exoplanetController.getAllExoplanets);
router.post('/', auth, exoplanetController.createExoplanet);
router.post('/csv', auth, exoplanetController.importCSV);

module.exports = router;