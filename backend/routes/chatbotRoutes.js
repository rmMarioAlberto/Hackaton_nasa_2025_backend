const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// Ruta pública para el chatbot
router.post('/query', chatbotController.handleQuery);

module.exports = router;