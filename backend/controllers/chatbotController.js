const mongoose = require('mongoose');
const configBD = require('../config/database');

const getQueryChatbot = async (req, res) => {
  try {
    const { query } = req.body;

    // Validar que query exista
    if (!query) {
      return res.status(400).json({ message: 'La consulta es necesaria' });
    }

    // Parsear query si viene como string
    let parsedQuery;
    try {
      parsedQuery = typeof query === 'string' ? JSON.parse(query) : query;
    } catch (parseError) {
      return res.status(400).json({ 
        message: 'El formato de la consulta no es válido. Debe ser un JSON válido.',
        error: parseError.message 
      });
    }

    // Asegurar que la conexión a MongoDB esté establecida
    if (mongoose.connection.readyState !== 1) {
      await configBD.connectMongo();
    }

    // Acceder a la base de datos y colección directamente
    const db = mongoose.connection.db;
    const collection = db.collection('planetas');

    // Ejecutar la consulta estructurada
    const results = await collection.find(parsedQuery).toArray();

    // Retornar los resultados
    return res.status(200).json({
      message: 'Consulta ejecutada con éxito',
      results: results,
      count: results.length
    });

  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al ejecutar la consulta', 
      error: error.message 
    });
  }
};
module.exports = { getQueryChatbot };
