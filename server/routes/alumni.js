const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const db = require('../db');
const { authenticateAdmin } = require('../middleware/auth');

// Helper to generate QR code data URL pointing to permanent alumni profile
async function generateAlumniQR(id) {
  const url = `/alumni/${id}`;
  return await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 400,
    color: {
      dark: '#0f172a',
      light: '#ffffff'
    }
  });
}

function formatAlumni(a) {
  if (!a) return null;
  return {
    id: a.id,
    name: a.name,
    admission_number: a.admission_number || '',
    email: a.email || '',
    time_span: a.time_span || a.batch || '',
    role: a.previous_role || a.current_role || a.role || '',
    bio: a.bio || '',
    photo_url: a.photo_url || '',
    qr_data: a.qr_data || null,
    status: a.status || 'active'
  };
}

// GET /api/alumni (Public - all active alumni)
router.get('/', async (req, res) => {
  try {
    const list = db.prepare("SELECT * FROM alumni WHERE status = 'active' ORDER BY id ASC").all();
    
    // Ensure all alumni have QR codes
    const formatted = [];
    for (const a of list) {
      if (!a.qr_data) {
        try {
          const qr = await generateAlumniQR(a.id);
          db.prepare('UPDATE alumni SET qr_data = ? WHERE id = ?').run(qr, a.id);
          a.qr_data = qr;
        } catch (qrErr) {
          console.error('Error generating alumni QR:', qrErr);
        }
      }
      formatted.push(formatAlumni(a));
    }

    res.json(formatted);
  } catch (err) {
    console.error('Fetch alumni error:', err);
    res.status(500).json({ error: 'Failed to fetch alumni' });
  }
});

// GET /api/alumni/all (Admin only - includes inactive)
router.get('/all', authenticateAdmin, async (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM alumni ORDER BY id DESC').all();
    for (const a of list) {
      if (!a.qr_data) {
        try {
          const qr = await generateAlumniQR(a.id);
          db.prepare('UPDATE alumni SET qr_data = ? WHERE id = ?').run(qr, a.id);
          a.qr_data = qr;
        } catch (e) {}
      }
    }
    res.json(list.map(formatAlumni));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all alumni' });
  }
});

// GET /api/alumni/:id (Public - single alumni details for public profile from QR)
router.get('/:id', async (req, res) => {
  try {
    const a = db.prepare('SELECT * FROM alumni WHERE id = ?').get(req.params.id);
    if (!a) {
      return res.status(404).json({ error: 'Alumni not found' });
    }

    if (!a.qr_data) {
      try {
        const qr = await generateAlumniQR(a.id);
        db.prepare('UPDATE alumni SET qr_data = ? WHERE id = ?').run(qr, a.id);
        a.qr_data = qr;
      } catch (e) {}
    }

    res.json({
      alumni: formatAlumni(a)
    });
  } catch (err) {
    console.error('Fetch single alumni error:', err);
    res.status(500).json({ error: 'Failed to fetch alumni profile' });
  }
});

// POST /api/alumni (Admin only - add alumni)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { name, admission_number, email, time_span, role, bio, photo_url } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Alumni name is required' });
    }

    const assignedRole = (role && role.trim()) ? role.trim() : 'NIRVANA Alumni';
    const admNo = admission_number ? admission_number.trim() : `U20${Date.now().toString().slice(-3)}`;
    const userEmail = email ? email.trim() : `${name.trim().toLowerCase().replace(/\s+/g, '.')}@alumni.svnit.ac.in`;
    const span = time_span ? time_span.trim() : '2020 – 2024';

    const stmt = db.prepare(`
      INSERT INTO alumni (
        name, admission_number, email, time_span, previous_role, current_role, batch, bio, photo_url, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name.trim(),
      admNo,
      userEmail,
      span,
      assignedRole,
      assignedRole,
      span,
      bio ? bio.trim() : '',
      photo_url ? photo_url.trim() : '',
      'active'
    );

    const newId = result.lastInsertRowid;
    const qrData = await generateAlumniQR(newId);
    db.prepare('UPDATE alumni SET qr_data = ? WHERE id = ?').run(qrData, newId);

    const created = db.prepare('SELECT * FROM alumni WHERE id = ?').get(newId);
    res.status(201).json({
      message: 'Alumni profile created successfully',
      alumni: formatAlumni(created)
    });
  } catch (err) {
    console.error('Create alumni error:', err);
    res.status(500).json({ error: 'Failed to create alumni profile' });
  }
});

// PUT /api/alumni/:id (Admin only - update alumni)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const existing = db.prepare('SELECT * FROM alumni WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Alumni not found' });
    }

    const { name, admission_number, email, time_span, role, bio, photo_url } = req.body;
    const assignedRole = role !== undefined ? role.trim() : (existing.previous_role || existing.current_role);

    const stmt = db.prepare(`
      UPDATE alumni SET
        name = ?,
        admission_number = ?,
        email = ?,
        time_span = ?,
        previous_role = ?,
        current_role = ?,
        batch = ?,
        bio = ?,
        photo_url = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      name ? name.trim() : existing.name,
      admission_number !== undefined ? admission_number.trim() : (existing.admission_number || ''),
      email !== undefined ? email.trim() : (existing.email || ''),
      time_span !== undefined ? time_span.trim() : (existing.time_span || existing.batch || ''),
      assignedRole,
      assignedRole,
      time_span !== undefined ? time_span.trim() : (existing.batch || 'Alumni'),
      bio !== undefined ? bio.trim() : existing.bio,
      photo_url !== undefined ? photo_url.trim() : existing.photo_url,
      id
    );

    // Ensure QR code is present
    if (!existing.qr_data) {
      const qrData = await generateAlumniQR(id);
      db.prepare('UPDATE alumni SET qr_data = ? WHERE id = ?').run(qrData, id);
    }

    const updated = db.prepare('SELECT * FROM alumni WHERE id = ?').get(id);
    res.json({
      message: 'Alumni updated successfully',
      alumni: formatAlumni(updated)
    });
  } catch (err) {
    console.error('Update alumni error:', err);
    res.status(500).json({ error: 'Failed to update alumni' });
  }
});

// DELETE /api/alumni/:id (Admin only - remove alumni)
router.delete('/:id', authenticateAdmin, (req, res) => {
  try {
    const id = req.params.id;
    const existing = db.prepare('SELECT * FROM alumni WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Alumni not found' });
    }

    db.prepare('DELETE FROM alumni WHERE id = ?').run(id);
    res.json({ message: 'Alumni profile deleted successfully' });
  } catch (err) {
    console.error('Delete alumni error:', err);
    res.status(500).json({ error: 'Failed to delete alumni' });
  }
});

module.exports = router;
