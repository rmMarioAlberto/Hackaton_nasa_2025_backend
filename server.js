    // backend/server.js

    require('dotenv').config({ path: './.env' });
    const express = require('express');
    const cors = require('cors'); // Se importa una sola vez
    const { connectPostgres, connectMongo } = require('./backend/config/database');
    const exoplanetRoutes = require('./backend/routes/exoplanetRoutes');
    // const chatbotRoutes = require('./backend/routes/chatbotRoutes');
    const authRoutes = require('./backend/routes/authRoutes');
    const chatbotRoutes = require('./backend/routes/chatbotRoutes');
    const app = express();

    // Middlewares
    app.use(cors()); // Se usa aquí, antes de las rutas
    app.use(express.json());

    // Conectar a bases de datos
    connectPostgres();
    connectMongo();

    // Rutas
    app.use('/api/exoplanets', exoplanetRoutes);
    app.use('/api/chatbot', chatbotRoutes);
    app.use('/api/auth', authRoutes);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));