const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateAdmin } = require('../middleware/auth');

// GET /api/certificates (Public - public certificates with search & filters)
router.get('/', (req, res) => {
  try {
    const { search, type, recipient_type } = req.query;
    let query = `
      SELECT c.*, 
             m.name as member_name, m.member_id as member_code,
             a.name as alumni_name, a.batch as alumni_batch
      FROM certificates c
      LEFT JOIN team_members m ON c.team_member_id = m.id
      LEFT JOIN alumni a ON c.alumni_id = a.id
      WHERE c.is_public = 1
    `;
    const params = [];

    if (search) {
      query += ' AND (c.title LIKE ? OR c.recipient_name LIKE ? OR c.verification_id LIKE ? OR c.description LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (type && type !== 'all') {
      query += ' AND c.certificate_type = ?';
      params.push(type);
    }

    if (recipient_type && recipient_type !== 'all') {
      query += ' AND c.recipient_type = ?';
      params.push(recipient_type);
    }

    query += ' ORDER BY c.issue_date DESC, c.id DESC';
    const certs = db.prepare(query).all(...params);

    res.json(certs);
  } catch (err) {
    console.error('Fetch certificates error:', err);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// GET /api/certificates/all (Admin only - includes private)
router.get('/all', authenticateAdmin, (req, res) => {
  try {
    const query = `
      SELECT c.*, 
             m.name as member_name, m.member_id as member_code,
             a.name as alumni_name, a.batch as alumni_batch
      FROM certificates c
      LEFT JOIN team_members m ON c.team_member_id = m.id
      LEFT JOIN alumni a ON c.alumni_id = a.id
      ORDER BY c.id DESC
    `;
    const certs = db.prepare(query).all();
    res.json(certs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all certificates' });
  }
});

// GET /api/certificates/types (Public - distinct types)
router.get('/types', (req, res) => {
  try {
    const types = db.prepare('SELECT DISTINCT certificate_type FROM certificates WHERE certificate_type IS NOT NULL ORDER BY certificate_type ASC').all();
    res.json(types.map(t => t.certificate_type));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch certificate types' });
  }
});

// GET /api/certificates/:id (Public or admin)
router.get('/:id', (req, res) => {
  try {
    const cert = db.prepare(`
      SELECT c.*, 
             m.name as member_name, m.member_id as member_code,
             a.name as alumni_name, a.batch as alumni_batch
      FROM certificates c
      LEFT JOIN team_members m ON c.team_member_id = m.id
      LEFT JOIN alumni a ON c.alumni_id = a.id
      WHERE c.id = ?
    `).get(req.params.id);

    if (!cert) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    res.json(cert);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch certificate details' });
  }
});

// POST /api/certificates (Admin only - create)
router.post('/', authenticateAdmin, (req, res) => {
  try {
    let {
      title,
      recipient_name,
      recipient_type,
      team_member_id,
      alumni_id,
      certificate_type,
      issue_date,
      description,
      file_url,
      verification_id,
      is_public
    } = req.body;

    if (!title || !recipient_name || !file_url) {
      return res.status(400).json({ error: 'Title, recipient name, and certificate file/image URL are required' });
    }

    // Auto-generate verification_id if missing
    if (!verification_id || !verification_id.trim()) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const year = new Date().getFullYear();
      verification_id = `CERT-ARC-${year}-${randomSuffix}`;
    } else {
      verification_id = verification_id.trim().toUpperCase();
    }

    const stmt = db.prepare(`
      INSERT INTO certificates (
        title, recipient_name, recipient_type, team_member_id, alumni_id,
        certificate_type, issue_date, description, file_url, verification_id, is_public
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title.trim(),
      recipient_name.trim(),
      recipient_type || 'team_member',
      team_member_id ? Number(team_member_id) : null,
      alumni_id ? Number(alumni_id) : null,
      certificate_type || 'Achievement',
      issue_date || new Date().toISOString().split('T')[0],
      description || '',
      file_url.trim(),
      verification_id,
      is_public !== undefined ? (is_public ? 1 : 0) : 1
    );

    const created = db.prepare('SELECT * FROM certificates WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({
      message: 'Certificate created successfully',
      certificate: created
    });
  } catch (err) {
    console.error('Create certificate error:', err);
    res.status(500).json({ error: 'Failed to create certificate' });
  }
});

// PUT /api/certificates/:id (Admin only - update)
router.put('/:id', authenticateAdmin, (req, res) => {
  try {
    const id = req.params.id;
    const existing = db.prepare('SELECT * FROM certificates WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const {
      title,
      recipient_name,
      recipient_type,
      team_member_id,
      alumni_id,
      certificate_type,
      issue_date,
      description,
      file_url,
      verification_id,
      is_public
    } = req.body;

    const stmt = db.prepare(`
      UPDATE certificates SET
        title = ?,
        recipient_name = ?,
        recipient_type = ?,
        team_member_id = ?,
        alumni_id = ?,
        certificate_type = ?,
        issue_date = ?,
        description = ?,
        file_url = ?,
        verification_id = ?,
        is_public = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      title ? title.trim() : existing.title,
      recipient_name ? recipient_name.trim() : existing.recipient_name,
      recipient_type || existing.recipient_type,
      team_member_id !== undefined ? (team_member_id ? Number(team_member_id) : null) : existing.team_member_id,
      alumni_id !== undefined ? (alumni_id ? Number(alumni_id) : null) : existing.alumni_id,
      certificate_type || existing.certificate_type,
      issue_date || existing.issue_date,
      description !== undefined ? description : existing.description,
      file_url ? file_url.trim() : existing.file_url,
      verification_id ? verification_id.trim().toUpperCase() : existing.verification_id,
      is_public !== undefined ? (is_public ? 1 : 0) : existing.is_public,
      id
    );

    const updated = db.prepare('SELECT * FROM certificates WHERE id = ?').get(id);
    res.json({
      message: 'Certificate updated successfully',
      certificate: updated
    });
  } catch (err) {
    console.error('Update certificate error:', err);
    res.status(500).json({ error: 'Failed to update certificate' });
  }
});

// DELETE /api/certificates/:id (Admin only - delete)
router.delete('/:id', authenticateAdmin, (req, res) => {
  try {
    const id = req.params.id;
    const existing = db.prepare('SELECT id, title FROM certificates WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    db.prepare('DELETE FROM certificates WHERE id = ?').run(id);
    res.json({ message: `Certificate "${existing.title}" deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete certificate' });
  }
});

module.exports = router;
