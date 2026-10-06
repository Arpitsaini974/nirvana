const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateAdmin } = require('../middleware/auth');

// POST /api/messages (Public contact submission)
router.post('/', (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const stmt = db.prepare(`
      INSERT INTO contact_messages (name, email, subject, message)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(name.trim(), email.trim(), subject ? subject.trim() : 'General Inquiry', message.trim());

    res.status(201).json({ message: 'Thank you for reaching out! We will get back to you shortly.' });
  } catch (err) {
    console.error('Contact submission error:', err);
    res.status(500).json({ error: 'Failed to submit contact message' });
  }
});

// GET /api/messages (Admin only)
router.get('/', authenticateAdmin, (req, res) => {
  try {
    const messages = db.prepare('SELECT * FROM contact_messages ORDER BY id DESC').all();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// PATCH /api/messages/:id/read (Admin only)
router.patch('/:id/read', authenticateAdmin, (req, res) => {
  try {
    const id = req.params.id;
    db.prepare('UPDATE contact_messages SET is_read = 1 WHERE id = ?').run(id);
    res.json({ message: 'Message marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// DELETE /api/messages/:id (Admin only)
router.delete('/:id', authenticateAdmin, (req, res) => {
  try {
    const id = req.params.id;
    db.prepare('DELETE FROM contact_messages WHERE id = ?').run(id);
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

module.exports = router;
