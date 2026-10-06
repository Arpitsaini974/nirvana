const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Ensure database and tables are initialized
require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads folder
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/members', require('./routes/members'));
app.use('/api/alumni', require('./routes/alumni'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/events', require('./routes/events'));
app.use('/api/media', require('./routes/media'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/professors', require('./routes/professors'));
app.use('/api/stats', require('./routes/stats'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Club Management & Public Verification API', timestamp: new Date() });
});

// Production client serving
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(clientDist, 'index.html'));
    }
    next();
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'An unexpected internal error occurred' });
});

app.listen(PORT, () => {
  console.log(`Club Management Backend running at http://localhost:${PORT}`);
});
