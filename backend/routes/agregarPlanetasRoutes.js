const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/analisisPlanetas');

// Ruta pública para el chatbot
router.post('/agregarPlanetas', chatbotController.agregarPlanetas);

module.exports = router;