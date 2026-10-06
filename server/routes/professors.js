const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateAdmin } = require('../middleware/auth');

// GET /api/professors (Public - list faculty/professors)
router.get('/', (req, res) => {
  try {
    const professors = db.prepare('SELECT id, name, role, bio, photo_url FROM professors ORDER BY display_order ASC, id ASC').all();
    res.json(professors);
  } catch (err) {
    console.error('Fetch professors error:', err);
    res.status(500).json({ error: 'Failed to fetch professors' });
  }
});

// GET /api/professors/:id (Public - single professor details)
router.get('/:id', (req, res) => {
  try {
    const professor = db.prepare('SELECT id, name, role, bio, photo_url FROM professors WHERE id = ?').get(req.params.id);
    if (!professor) {
      return res.status(404).json({ error: 'Professor not found' });
    }
    res.json(professor);
  } catch (err) {
    console.error('Fetch professor error:', err);
    res.status(500).json({ error: 'Failed to fetch professor' });
  }
});

// POST /api/professors (Admin - create professor)
router.post('/', authenticateAdmin, (req, res) => {
  try {
    const { name, role, bio, photo_url } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Professor name is required' });
    }
    if (!role || !role.trim()) {
      return res.status(400).json({ error: 'Role / position is required' });
    }

    const stmt = db.prepare(`
      INSERT INTO professors (name, role, bio, photo_url)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      name.trim(),
      role.trim(),
      bio ? bio.trim() : '',
      photo_url ? photo_url.trim() : ''
    );

    const created = db.prepare('SELECT id, name, role, bio, photo_url FROM professors WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({
      message: 'Professor added successfully',
      professor: created
    });
  } catch (err) {
    console.error('Create professor error:', err);
    res.status(500).json({ error: 'Failed to add professor' });
  }
});

// PUT /api/professors/:id (Admin - update professor)
router.put('/:id', authenticateAdmin, (req, res) => {
  try {
    const id = req.params.id;
    const existing = db.prepare('SELECT * FROM professors WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Professor not found' });
    }

    const { name, role, bio, photo_url } = req.body;

    const stmt = db.prepare(`
      UPDATE professors SET
        name = ?,
        role = ?,
        bio = ?,
        photo_url = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      name ? name.trim() : existing.name,
      role ? role.trim() : existing.role,
      bio !== undefined ? (bio ? bio.trim() : '') : existing.bio,
      photo_url !== undefined ? (photo_url ? photo_url.trim() : '') : existing.photo_url,
      id
    );

    const updated = db.prepare('SELECT id, name, role, bio, photo_url FROM professors WHERE id = ?').get(id);
    res.json({
      message: 'Professor updated successfully',
      professor: updated
    });
  } catch (err) {
    console.error('Update professor error:', err);
    res.status(500).json({ error: 'Failed to update professor' });
  }
});

// DELETE /api/professors/:id (Admin - remove professor)
router.delete('/:id', authenticateAdmin, (req, res) => {
  try {
    const id = req.params.id;
    const existing = db.prepare('SELECT * FROM professors WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Professor not found' });
    }

    db.prepare('DELETE FROM professors WHERE id = ?').run(id);
    res.json({ message: 'Professor removed successfully' });
  } catch (err) {
    console.error('Delete professor error:', err);
    res.status(500).json({ error: 'Failed to remove professor' });
  }
});

module.exports = router;
