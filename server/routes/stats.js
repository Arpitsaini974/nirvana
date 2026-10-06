const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateAdmin } = require('../middleware/auth');

// GET /api/stats (Admin only)
router.get('/', authenticateAdmin, (req, res) => {
  try {
    const totalMembers = db.prepare('SELECT count(*) as count FROM team_members').get().count;
    const activeMembers = db.prepare("SELECT count(*) as count FROM team_members WHERE status = 'active'").get().count;
    const totalAlumni = db.prepare('SELECT count(*) as count FROM alumni').get().count;
    const totalCertificates = db.prepare('SELECT count(*) as count FROM certificates').get().count;
    const totalEvents = db.prepare('SELECT count(*) as count FROM events').get().count;
    const unreadMessages = db.prepare('SELECT count(*) as count FROM contact_messages WHERE is_read = 0').get().count;

    const recentMembers = db.prepare('SELECT id, member_id, name, role, department, status, created_at, photo_url FROM team_members ORDER BY id DESC LIMIT 5').all();
    const recentAlumni = db.prepare('SELECT id, name, batch, previous_role, current_company, photo_url FROM alumni ORDER BY id DESC LIMIT 5').all();
    const recentCertificates = db.prepare('SELECT id, title, recipient_name, certificate_type, issue_date FROM certificates ORDER BY id DESC LIMIT 5').all();
    const recentEvents = db.prepare('SELECT id, title, date, location, status FROM events ORDER BY date DESC LIMIT 5').all();

    res.json({
      metrics: {
        totalMembers,
        activeMembers,
        inactiveMembers: totalMembers - activeMembers,
        totalAlumni,
        totalCertificates,
        totalEvents,
        unreadMessages
      },
      recentMembers,
      recentAlumni,
      recentCertificates,
      recentEvents
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

module.exports = router;
