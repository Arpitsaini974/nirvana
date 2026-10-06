const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateAdmin } = require('../middleware/auth');

// GET /api/events/stats (Public - real-time statistics for Events header)
router.get('/stats', (req, res) => {
  try {
    const total = db.prepare('SELECT count(*) as count FROM events').get().count;
    const upcoming = db.prepare("SELECT count(*) as count FROM events WHERE status = 'upcoming'").get().count;
    const live = db.prepare("SELECT count(*) as count FROM events WHERE status = 'live'").get().count;
    const past = db.prepare("SELECT count(*) as count FROM events WHERE status = 'past'").get().count;

    const categories = db.prepare("SELECT DISTINCT category FROM events WHERE category IS NOT NULL AND category != ''").all().map(c => c.category);
    const eventTypes = db.prepare("SELECT DISTINCT event_type FROM events WHERE event_type IS NOT NULL AND event_type != ''").all().map(t => t.event_type);
    const deliveryModes = db.prepare("SELECT DISTINCT delivery_mode FROM events WHERE delivery_mode IS NOT NULL AND delivery_mode != ''").all().map(m => m.delivery_mode);

    // Extract years from dates
    const yearsRaw = db.prepare("SELECT DISTINCT substr(date, 1, 4) as year FROM events WHERE date IS NOT NULL AND length(date) >= 4 ORDER BY year DESC").all();
    const years = yearsRaw.map(y => y.year);

    res.json({
      total,
      upcoming,
      live,
      past,
      categories,
      eventTypes,
      deliveryModes,
      years
    });
  } catch (err) {
    console.error('Fetch event stats error:', err);
    res.status(500).json({ error: 'Failed to fetch event statistics' });
  }
});

// GET /api/events (Public - list events with search and multi-dimensional filters)
router.get('/', (req, res) => {
  try {
    const { 
      search, 
      status, 
      category, 
      event_type, 
      delivery_mode, 
      year,
      location 
    } = req.query;

    let query = 'SELECT * FROM events WHERE 1=1';
    const params = [];

    // Search by title, speaker, keywords, description, location
    if (search && search.trim()) {
      query += ` AND (
        title LIKE ? OR 
        speakers LIKE ? OR 
        description LIKE ? OR 
        short_description LIKE ? OR 
        location LIKE ? OR 
        category LIKE ?
      )`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term, term, term);
    }

    // Status filter: 'upcoming', 'live', 'past'
    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    // Category / Domain filter
    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    // Event Type filter (e.g. Workshop, Competition, Lecture)
    if (event_type && event_type !== 'all') {
      query += ' AND event_type = ?';
      params.push(event_type);
    }

    // Delivery Mode filter (Online, Offline, Hybrid)
    if (delivery_mode && delivery_mode !== 'all') {
      query += ' AND delivery_mode = ?';
      params.push(delivery_mode);
    }

    // Year filter
    if (year && year !== 'all') {
      query += ' AND date LIKE ?';
      params.push(`${year}%`);
    }

    // Location filter
    if (location && location !== 'all') {
      query += ' AND location LIKE ?';
      params.push(`%${location}%`);
    }

    // Ordering: live first, then upcoming by date ascending, then past by date descending
    query += " ORDER BY CASE status WHEN 'live' THEN 1 WHEN 'upcoming' THEN 2 ELSE 3 END, date DESC, id DESC";
    const events = db.prepare(query).all(...params);
    res.json(events);
  } catch (err) {
    console.error('Fetch events error:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET /api/events/featured (Public - featured/recent for homepage)
router.get('/featured', (req, res) => {
  try {
    const events = db.prepare(`
      SELECT * FROM events 
      ORDER BY CASE status WHEN 'live' THEN 1 WHEN 'upcoming' THEN 2 ELSE 3 END, date DESC 
      LIMIT 3
    `).all();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch featured events' });
  }
});

// GET /api/events/:id (Public - single event details for /events/:eventId)
router.get('/:id', (req, res) => {
  try {
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event details' });
  }
});

// POST /api/events (Admin only - create event)
router.post('/', authenticateAdmin, (req, res) => {
  try {
    const {
      title,
      date,
      time,
      location,
      image_url,
      short_description,
      description,
      category,
      event_type,
      delivery_mode,
      speakers,
      organizer,
      registration_url,
      registration_link,
      status
    } = req.body;

    if (!title || !date) {
      return res.status(400).json({ error: 'Event title and date are required' });
    }

    const regUrl = registration_url || registration_link || '';

    const stmt = db.prepare(`
      INSERT INTO events (
        title, date, time, location, image_url,
        short_description, description, category, event_type,
        delivery_mode, speakers, organizer, registration_url, registration_link, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title.trim(),
      date.trim(),
      time ? time.trim() : '10:00 AM - 1:00 PM',
      location ? location.trim() : 'Campus Auditorium / Lab',
      image_url || '',
      short_description ? short_description.trim() : '',
      description ? description.trim() : '',
      category ? category.trim() : 'Robotics & Hardware',
      event_type ? event_type.trim() : 'Workshop',
      delivery_mode ? delivery_mode.trim() : 'Offline',
      speakers ? speakers.trim() : '',
      organizer ? organizer.trim() : 'Club Executive Council',
      regUrl,
      regUrl,
      status || 'upcoming'
    );

    const created = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({
      message: 'Event created successfully',
      event: created
    });
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PUT /api/events/:id (Admin only - update event)
router.put('/:id', authenticateAdmin, (req, res) => {
  try {
    const id = req.params.id;
    const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const {
      title,
      date,
      time,
      location,
      image_url,
      short_description,
      description,
      category,
      event_type,
      delivery_mode,
      speakers,
      organizer,
      registration_url,
      registration_link,
      status
    } = req.body;

    const regUrl = registration_url !== undefined ? registration_url : (registration_link !== undefined ? registration_link : existing.registration_url);

    const stmt = db.prepare(`
      UPDATE events SET
        title = ?,
        date = ?,
        time = ?,
        location = ?,
        image_url = ?,
        short_description = ?,
        description = ?,
        category = ?,
        event_type = ?,
        delivery_mode = ?,
        speakers = ?,
        organizer = ?,
        registration_url = ?,
        registration_link = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      title ? title.trim() : existing.title,
      date ? date.trim() : existing.date,
      time !== undefined ? (time ? time.trim() : '') : existing.time,
      location !== undefined ? location.trim() : existing.location,
      image_url !== undefined ? image_url : existing.image_url,
      short_description !== undefined ? short_description : existing.short_description,
      description !== undefined ? description : existing.description,
      category !== undefined ? category : existing.category,
      event_type !== undefined ? event_type : existing.event_type,
      delivery_mode !== undefined ? delivery_mode : existing.delivery_mode,
      speakers !== undefined ? speakers : existing.speakers,
      organizer !== undefined ? organizer : existing.organizer,
      regUrl,
      regUrl,
      status || existing.status,
      id
    );

    const updated = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    res.json({
      message: 'Event updated successfully',
      event: updated
    });
  } catch (err) {
    console.error('Update event error:', err);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE /api/events/:id (Admin only - delete event)
router.delete('/:id', authenticateAdmin, (req, res) => {
  try {
    const id = req.params.id;
    const existing = db.prepare('SELECT id, title FROM events WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Event not found' });
    }

    db.prepare('DELETE FROM events WHERE id = ?').run(id);
    res.json({ message: `Event "${existing.title}" deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

module.exports = router;
