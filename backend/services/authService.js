// backend/services/authService.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sql } = require('../config/database');
const { JWT_SECRET } = require('../config/env');

async function login(email, password) {
  try {
    // Fetch user with role information and password_hash
    const userResult = await sql`
      SELECT u.id, u.email, u.password_hash, u.role_id, r.name as role_name, u.created_at, u.updated_at 
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.email = ${email}
    `;
    const user = userResult[0]; // Neon returns array of objects

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
      { userId: user.id, email: user.email, roleId: user.role_id, roleName: user.role_name },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Store token in tokens table
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await sql`
      INSERT INTO tokens (user_id, token, expires_at) 
      VALUES (${user.id}, ${token}, ${expiresAt}) 
      RETURNING id
    `;

    // Return user data and token
    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role_name,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    };
  } catch (error) {
    console.error('Login error:', error.message);
    return { success: false, message: 'Server error' };
  }
}

module.exports = { login };