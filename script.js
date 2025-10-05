// server.js - Versión Limpia y Unificada
require('dotenv').config(); // No necesitas path si .env está en la raíz
const express = require('express');
const { connectPostgres, connectMongo } = require('./backend/config/database');
const chatbotRoutes = require('./backend/routes/chatbotRoutes');
const authRoutes = require('./backend/routes/authRoutes');

const app = express();

// Middlewares
app.use(express.json()); // Solo necesitas declararlo una vez

// Conectar a bases de datos
connectPostgres();
connectMongo();

// Rutas
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor principal corriendo en el puerto ${PORT}`));