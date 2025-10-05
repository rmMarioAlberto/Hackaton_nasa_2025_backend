const express = require('express');
const router = express.Router();
const { getExoplanets, searchExoplanets } = require('../controllers/exoplanetController');
const { verifyToken } = require('../middlewares/auth');

// Route to get exoplanets with pagination (no auth required)
router.get('/:page', getExoplanets);

// Route to search exoplanets with filters (no auth required)
router.get('/search', searchExoplanets);

// Existing routes for authenticated users (e.g., CRUD operations)
router.use(verifyToken); // Apply auth middleware for protected routes
// Add other routes like POST, PUT, DELETE for exoplanet CRUD here

module.exports = router;