// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { login } = require('../services/authService');

router.post('/login', async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: 'Request body is missing or invalid' });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const result = await login(email, password);
  if (result.success) {
    res.json({
      token: result.token,
      user: result.user
    });
  } else {
    res.status(401).json({ message: result.message });
  }
});

module.exports = router;