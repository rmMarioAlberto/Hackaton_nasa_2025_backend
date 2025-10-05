// backend/routes/exoplanetRoutes.js
const express = require('express');
const router = express.Router();
const { getExoplanets, searchExoplanets } = require('../controllers/exoplanetController');
const { verifyToken } = require('../middlewares/auth');

// IMPORTANTE: La ruta más específica debe ir PRIMERO
// Route to search exoplanets with filters (no auth required)
router.get('/search', searchExoplanets);  // ← Esta debe ir PRIMERO

// Route to get exoplanets with pagination (no auth required)
router.get('/:page', getExoplanets);      // ← Esta va después

// Existing routes for authenticated users (e.g., CRUD operations)
router.use(verifyToken); // Apply auth middleware for protected routes
// Add other routes like POST, PUT, DELETE for exoplanet CRUD here

module.exports = router;