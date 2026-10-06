const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dbPath = path.join(__dirname, 'club.db');
const db = new Database(dbPath);

// Enable WAL mode for high performance and concurrent reads
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS club_settings (
    id INTEGER PRIMARY KEY,
    club_name TEXT NOT NULL,
    tagline TEXT,
    logo_url TEXT,
    favicon_url TEXT,
    banner_url TEXT,
    about TEXT,
    history TEXT,
    mission TEXT,
    vision TEXT,
    objectives TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    social_links TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    location TEXT,
    image_url TEXT,
    short_description TEXT,
    description TEXT,
    category TEXT DEFAULT 'Robotics',
    event_type TEXT DEFAULT 'Workshop',
    delivery_mode TEXT DEFAULT 'Offline',
    speakers TEXT,
    organizer TEXT,
    status TEXT DEFAULT 'upcoming',
    registration_url TEXT,
    registration_link TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS team_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    photo_url TEXT,
    role TEXT NOT NULL,
    department TEXT NOT NULL,
    joining_date TEXT,
    bio TEXT,
    skills TEXT,
    achievements TEXT,
    status TEXT DEFAULT 'active',
    qr_data TEXT,
    is_featured INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS alumni (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    photo_url TEXT,
    batch TEXT NOT NULL,
    previous_role TEXT NOT NULL,
    department TEXT,
    current_company TEXT,
    current_role TEXT,
    bio TEXT,
    achievements TEXT,
    status TEXT DEFAULT 'active',
    linkedin_url TEXT,
    is_featured INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    recipient_type TEXT NOT NULL, -- 'team_member', 'alumni', 'club'
    team_member_id INTEGER REFERENCES team_members(id) ON DELETE SET NULL,
    alumni_id INTEGER REFERENCES alumni(id) ON DELETE SET NULL,
    certificate_type TEXT NOT NULL,
    issue_date TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    verification_id TEXT UNIQUE,
    is_public INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS media_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    mime_type TEXT,
    file_size INTEGER,
    category TEXT DEFAULT 'general',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS professors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    bio TEXT,
    photo_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Auto-migrate tables if needed
try {
  const alumniCols = db.prepare("PRAGMA table_info(alumni)").all().map(c => c.name);
  if (!alumniCols.includes('qr_data')) {
    db.exec(`ALTER TABLE alumni ADD COLUMN qr_data TEXT`);
  }
  if (!alumniCols.includes('admission_number')) {
    db.exec(`ALTER TABLE alumni ADD COLUMN admission_number TEXT`);
  }
  if (!alumniCols.includes('email')) {
    db.exec(`ALTER TABLE alumni ADD COLUMN email TEXT`);
  }
  if (!alumniCols.includes('time_span')) {
    db.exec(`ALTER TABLE alumni ADD COLUMN time_span TEXT`);
  }

  const eventCols = db.prepare("PRAGMA table_info(events)").all().map(c => c.name);
  const colsToAdd = [
    { name: 'time', type: 'TEXT' },
    { name: 'category', type: "TEXT DEFAULT 'Robotics'" },
    { name: 'event_type', type: "TEXT DEFAULT 'Workshop'" },
    { name: 'delivery_mode', type: "TEXT DEFAULT 'Offline'" },
    { name: 'speakers', type: 'TEXT' },
    { name: 'registration_url', type: 'TEXT' }
  ];
  for (const c of colsToAdd) {
    if (!eventCols.includes(c.name)) {
      db.exec(`ALTER TABLE events ADD COLUMN ${c.name} ${c.type}`);
    }
  }
} catch (err) {
  console.error('Migration check:', err);
}

module.exports = db;
