const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const db = require('../db');
const { authenticateAdmin } = require('../middleware/auth');

// Helper to generate QR code data URL pointing to permanent member profile
async function generateMemberQR(id) {
  const url = `/team/${id}`;
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

function formatMember(m) {
  if (!m) return null;
  return {
    id: m.id,
    member_id: m.member_id || `NIRVANA-${m.id}`,
    name: m.name,
    role: m.role,
    bio: m.bio || '',
    photo_url: m.photo_url || '',
    qr_data: m.qr_data || null,
    status: m.status || 'active'
  };
}

// GET /api/members (Public - list active team members)
router.get('/', async (req, res) => {
  try {
    const list = db.prepare("SELECT * FROM team_members WHERE status = 'active' ORDER BY id ASC").all();
    const formatted = [];
    for (const m of list) {
      if (!m.qr_data) {
        try {
          const qr = await generateMemberQR(m.id);
          db.prepare('UPDATE team_members SET qr_data = ? WHERE id = ?').run(qr, m.id);
          m.qr_data = qr;
        } catch (e) {}
      }
      formatted.push(formatMember(m));
    }
    res.json(formatted);
  } catch (err) {
    console.error('Fetch members error:', err);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// GET /api/members/all (Admin - includes inactive)
router.get('/all', authenticateAdmin, async (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM team_members ORDER BY id DESC').all();
    for (const m of list) {
      if (!m.qr_data) {
        try {
          const qr = await generateMemberQR(m.id);
          db.prepare('UPDATE team_members SET qr_data = ? WHERE id = ?').run(qr, m.id);
          m.qr_data = qr;
        } catch (e) {}
      }
    }
    res.json(list.map(formatMember));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all members' });
  }
});

// GET /api/members/:id (Public - single member profile for QR scan)
router.get('/:id', async (req, res) => {
  try {
    const param = req.params.id;
    // Check by numeric id or member_id string
    let m = null;
    if (!isNaN(param)) {
      m = db.prepare('SELECT * FROM team_members WHERE id = ?').get(param);
    }
    if (!m) {
      m = db.prepare('SELECT * FROM team_members WHERE member_id = ?').get(param);
    }

    if (!m) {
      return res.status(404).json({ exists: false, error: 'NIRVANA Team Member not found' });
    }

    if (!m.qr_data) {
      try {
        const qr = await generateMemberQR(m.id);
        db.prepare('UPDATE team_members SET qr_data = ? WHERE id = ?').run(qr, m.id);
        m.qr_data = qr;
      } catch (e) {}
    }

    res.json({
      exists: true,
      is_active: m.status === 'active',
      member: formatMember(m)
    });
  } catch (err) {
    console.error('Fetch member error:', err);
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

// POST /api/members (Admin - add team member)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { name, role, bio, photo_url } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Member name is required' });
    }
    if (!role || !role.trim()) {
      return res.status(400).json({ error: 'Role / position is required' });
    }

    const member_id = `NIRVANA-${Date.now().toString().slice(-4)}`;

    const stmt = db.prepare(`
      INSERT INTO team_members (
        member_id, name, role, department, bio, photo_url, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      member_id,
      name.trim(),
      role.trim(),
      'NIRVANA',
      bio ? bio.trim() : '',
      photo_url ? photo_url.trim() : '',
      'active'
    );

    const newId = result.lastInsertRowid;
    const qrData = await generateMemberQR(newId);
    db.prepare('UPDATE team_members SET qr_data = ? WHERE id = ?').run(qrData, newId);

    const created = db.prepare('SELECT * FROM team_members WHERE id = ?').get(newId);
    res.status(201).json({
      message: 'Team member added successfully',
      member: formatMember(created)
    });
  } catch (err) {
    console.error('Create member error:', err);
    res.status(500).json({ error: 'Failed to create team member' });
  }
});

// PUT /api/members/:id (Admin - update team member)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const existing = db.prepare('SELECT * FROM team_members WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    const { name, role, bio, photo_url } = req.body;

    const stmt = db.prepare(`
      UPDATE team_members SET
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
      bio !== undefined ? bio.trim() : existing.bio,
      photo_url !== undefined ? photo_url.trim() : existing.photo_url,
      id
    );

    if (!existing.qr_data) {
      const qrData = await generateMemberQR(id);
      db.prepare('UPDATE team_members SET qr_data = ? WHERE id = ?').run(qrData, id);
    }

    const updated = db.prepare('SELECT * FROM team_members WHERE id = ?').get(id);
    res.json({
      message: 'Team member updated successfully',
      member: formatMember(updated)
    });
  } catch (err) {
    console.error('Update member error:', err);
    res.status(500).json({ error: 'Failed to update team member' });
  }
});

// DELETE /api/members/:id (Admin - delete team member)
router.delete('/:id', authenticateAdmin, (req, res) => {
  try {
    const id = req.params.id;
    const existing = db.prepare('SELECT * FROM team_members WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    db.prepare('DELETE FROM team_members WHERE id = ?').run(id);
    res.json({ message: 'Team member deleted successfully' });
  } catch (err) {
    console.error('Delete member error:', err);
    res.status(500).json({ error: 'Failed to delete team member' });
  }
});

module.exports = router;
