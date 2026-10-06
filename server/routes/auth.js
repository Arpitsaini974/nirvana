const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticateAdmin, JWT_SECRET } = require('../middleware/auth');

// Initialize password reset table if not present
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
} catch (e) {
  console.error('Password reset table init error:', e);
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const admin = db.prepare('SELECT * FROM admins WHERE LOWER(email) = ?').get(cleanEmail);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: admin.id, name: admin.name, email: admin.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during authentication' });
  }
});

// POST /api/auth/forgot-password
// Generates a 6-digit verification code for the registered admin email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Please enter your registered admin email address' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const admin = db.prepare('SELECT id, name, email FROM admins WHERE LOWER(email) = ?').get(cleanEmail);

    if (!admin) {
      return res.status(404).json({ error: 'No administrator account found with this email address' });
    }

    // Clean any prior pending codes for this email
    db.prepare('DELETE FROM password_resets WHERE LOWER(email) = ?').run(cleanEmail);

    // Generate a secure 6-digit OTP code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins validity

    db.prepare(`
      INSERT INTO password_resets (email, code, expires_at)
      VALUES (?, ?, ?)
    `).run(cleanEmail, resetCode, expiresAt);

    console.log(`[AUTH] Password reset requested for ${cleanEmail}. Verification Code: ${resetCode}`);

    res.json({
      success: true,
      message: `Verification code generated for ${cleanEmail}. Valid for 15 minutes.`,
      code: resetCode // returned directly so administrator can immediately enter code even without SMTP mail server setup
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// POST /api/auth/reset-password
// Verifies code and updates password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, verification code, and new password are required' });
    }

    if (newPassword.trim().length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    // Verify record in password_resets
    const record = db.prepare(`
      SELECT * FROM password_resets 
      WHERE LOWER(email) = ? AND code = ?
      ORDER BY id DESC LIMIT 1
    `).get(cleanEmail, cleanCode);

    if (!record) {
      return res.status(400).json({ error: 'Invalid verification code or email address' });
    }

    // Check expiration
    if (new Date(record.expires_at).getTime() < Date.now()) {
      db.prepare('DELETE FROM password_resets WHERE id = ?').run(record.id);
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }

    // Hash new password and update admin
    const newHash = await bcrypt.hash(newPassword.trim(), 10);
    const updateResult = db.prepare(`
      UPDATE admins 
      SET password_hash = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE LOWER(email) = ?
    `).run(newHash, cleanEmail);

    if (updateResult.changes === 0) {
      return res.status(404).json({ error: 'Admin record could not be updated' });
    }

    // Remove used reset code
    db.prepare('DELETE FROM password_resets WHERE LOWER(email) = ?').run(cleanEmail);

    res.json({
      success: true,
      message: 'Password has been successfully updated! You can now log in with your new password.'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateAdmin, (req, res) => {
  try {
    const admin = db.prepare('SELECT id, name, email, created_at FROM admins WHERE id = ?').get(req.admin.id);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    res.json({ admin });
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify session' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticateAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.admin.id);
    const isMatch = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE admins SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newHash, req.admin.id);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update password' });
  }
});

module.exports = router;
