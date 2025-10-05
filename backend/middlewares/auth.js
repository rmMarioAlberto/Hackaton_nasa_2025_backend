// backend/middlewares/auth.js
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database'); // Changed from config/env
const { JWT_SECRET } = require('../config/env');

async function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check token in tokens table
    const tokenQuery = 'SELECT * FROM tokens WHERE token = $1 AND expires_at > NOW()';
    const tokenResult = await pool.query(tokenQuery, [token]);
    if (tokenResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = { verifyToken };