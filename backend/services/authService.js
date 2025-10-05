// backend/services/authService.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database'); // Changed from config/env
const { jwtSecret } = require('../config/env');

async function login(email, password) {
  try {
    // Fetch user
    const userQuery = 'SELECT * FROM users WHERE email = $1';
    const userResult = await pool.query(userQuery, [email]);
    const user = userResult.rows[0];

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return { success: false, message: 'Invalid password' };
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, roleId: user.role_id },
      jwtSecret,
      { expiresIn: '1h' }
    );

    // Store token in tokens table
    const tokenQuery = `
      INSERT INTO tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await pool.query(tokenQuery, [user.id, token, expiresAt]);

    return { success: true, token };
  } catch (error) {
    console.error('Login error:', error.message);
    return { success: false, message: 'Server error' };
  }
}

module.exports = { login };