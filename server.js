const express = require('express');
const dotenv = require('dotenv');
const exoplanetRoutes = require('./backend/routes/exoplanetRoutes');
const chatbotRoutes = require('./backend/routes/chatbotRoutes');
const { connectPostgres, connectMongo } = require('./backend/config/database');

dotenv.config();
const app = express();

app.use(express.json());

// Conectar a bases de datos
connectPostgres();
connectMongo();

// Rutas
app.use('/api/exoplanets', exoplanetRoutes);
app.use('/api/chatbot', chatbotRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));