const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema({
  query: { type: String, required: true },
  response: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ChatLog', chatLogSchema);