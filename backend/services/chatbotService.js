const ChatLog = require('../models/mongodb/ChatLog');

const processQuery = async (query) => {
  // Placeholder: Implement chatbot logic (e.g., query an external API or model)
  const response = `Response to: ${query}`;
  await ChatLog.create({ query, response });
  return response;
};

module.exports = { processQuery };