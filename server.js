require('dotenv').config({ path: './.env' });
const express = require('express');
const { connectPostgres, connectMongo } = require('./backend/config/database');
const exoplanetRoutes = require('./backend/routes/exoplanetRoutes');
const chatbotRoutes = require('./backend/routes/chatbotRoutes');
const authRoutes = require('./backend/routes/authRoutes');
const agregarPlanetas = require('./backend/routes/agregarPlanetasRoutes')

const app = express();

app.use(express.json());

// Conectar a bases de datos
connectPostgres();
connectMongo();

// Rutas
app.use('/api/exoplanets', exoplanetRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/planetas', agregarPlanetas);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));