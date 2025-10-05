const express = require('express');
const router = express.Router();

// --- CORRECCIÓN ---
// Se ajusta la ruta para que busque la carpeta 'models' un nivel arriba.
const Exoplanet = require('../models/ChatLog'); 
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/queryChatBot', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }
    
    // --- PASO A: BÚSQUEDA (RETRIEVAL) EN MONGODB ---
    // Se busca en la colección de exoplanetas un nombre que coincida con el mensaje del usuario.
    const databaseResults = await Exoplanet.find(
      // Se usa una expresión regular para una búsqueda flexible y no sensible a mayúsculas.
      { pl_name: new RegExp(message, 'i') }, 
      // Se seleccionan solo los campos más importantes para no saturar la respuesta.
      'pl_name discoverymethod disc_year pl_orbper pl_masse pl_rade' 
    ).limit(5); // Se limita la búsqueda a 5 resultados para una respuesta concisa.


    // --- PASO B: AUMENTACIÓN (AUGMENTATION) ---
    // Se prepara el contexto para la IA con los datos encontrados.
    let context = "No se encontró información en la base de datos sobre este tema.";
    if (databaseResults && databaseResults.length > 0) {
      context = `Información encontrada en la base de datos: ${JSON.stringify(databaseResults)}`;
    }

    // --- PASO C: GENERACIÓN (GENERATION) ---
    // --- CORRECCIÓN ---
    // Se cambia al modelo 'gemini-pro' para asegurar máxima compatibilidad con la API.
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemInstruction = `
      Eres un asistente experto en exoplanetas. Tu primera prioridad es usar la "Información encontrada en la base de datos" que se te proporciona.
      - Si encuentras uno o más exoplanetas, preséntalos al usuario en formato de lista. Para cada uno, incluye su nombre (pl_name), método de descubrimiento (discoverymethod) y año de descubrimiento (disc_year).
      - Si el usuario pide más detalles sobre uno específico de la lista, usa el resto de la información proporcionada.
      - Si la base de datos no arroja resultados, puedes usar tu conocimiento general para responder, pero siempre manteniéndote en el tema de exoplanetas.
      - Si el usuario pregunta algo que no tiene nada que ver con exoplanetas, declina amablemente la pregunta.
    `;

    const fullPrompt = `${systemInstruction}\n\n${context}\n\nPregunta del usuario: "${message}"`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const botReply = response.text();
    
    res.json({ reply: botReply });

  } catch (error) {
    console.error('Error en la ruta del chatbot:', error);
    res.status(500).json({ error: 'Falló la comunicación con el chatbot.' });
  }
});

module.exports = router;