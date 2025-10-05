const chatbotService = require('../services/chatbotService');

const handleQuery = async (req, res) => {
  try {
    const response = await chatbotService.processQuery(req.body.query);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: 'Error processing chatbot query' });
  }
};

module.exports = { handleQuery };