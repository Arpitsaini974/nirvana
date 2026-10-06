const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateAdmin } = require('../middleware/auth');

// GET /api/settings (Public)
router.get('/', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM club_settings WHERE id = 1').get();
    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    // Safely parse JSON fields
    let objectives = [];
    let social_links = {};

    try {
      if (settings.objectives) objectives = JSON.parse(settings.objectives);
    } catch (e) {
      objectives = [settings.objectives];
    }

    try {
      if (settings.social_links) social_links = JSON.parse(settings.social_links);
    } catch (e) {
      social_links = {};
    }

    res.json({
      ...settings,
      objectives,
      social_links
    });
  } catch (err) {
    console.error('Settings fetch error:', err);
    res.status(500).json({ error: 'Failed to retrieve club settings' });
  }
});

// PUT /api/settings (Admin only)
router.put('/', authenticateAdmin, (req, res) => {
  try {
    const {
      club_name,
      tagline,
      logo_url,
      favicon_url,
      banner_url,
      about,
      history,
      mission,
      vision,
      objectives,
      email,
      phone,
      address,
      social_links
    } = req.body;

    if (!club_name) {
      return res.status(400).json({ error: 'Club name is required' });
    }

    const objectivesStr = Array.isArray(objectives) ? JSON.stringify(objectives) : (typeof objectives === 'string' ? objectives : '[]');
    const socialLinksStr = typeof social_links === 'object' ? JSON.stringify(social_links) : (social_links || '{}');

    const updateStmt = db.prepare(`
      UPDATE club_settings SET
        club_name = ?,
        tagline = ?,
        logo_url = ?,
        favicon_url = ?,
        banner_url = ?,
        about = ?,
        history = ?,
        mission = ?,
        vision = ?,
        objectives = ?,
        email = ?,
        phone = ?,
        address = ?,
        social_links = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `);

    updateStmt.run(
      club_name,
      tagline || '',
      logo_url || '',
      favicon_url || '',
      banner_url || '',
      about || '',
      history || '',
      mission || '',
      vision || '',
      objectivesStr,
      email || '',
      phone || '',
      address || '',
      socialLinksStr
    );

    res.json({ message: 'Club settings updated successfully' });
  } catch (err) {
    console.error('Settings update error:', err);
    res.status(500).json({ error: 'Failed to update club settings' });
  }
});

module.exports = router;
