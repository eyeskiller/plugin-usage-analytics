import Database from 'better-sqlite3';
import path from 'path';

// Store DB in the project root (or outside if you prefer)
const dbPath = path.resolve(process.cwd(), 'analytics.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_uuid TEXT NOT NULL,
    plugin_name TEXT NOT NULL,
    plugin_version TEXT,
    server_version TEXT,
    server_software TEXT,
    java_version TEXT,
    os_arch TEXT,
    os_name TEXT,
    event_type TEXT,
    player_count INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE INDEX IF NOT EXISTS idx_plugin_name ON events(plugin_name);
  CREATE INDEX IF NOT EXISTS idx_server_uuid ON events(server_uuid);
  CREATE INDEX IF NOT EXISTS idx_created_at ON events(created_at);

  CREATE TABLE IF NOT EXISTS plugin_metadata (
    plugin_name TEXT PRIMARY KEY,
    latest_version TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  INSERT OR IGNORE INTO settings (key, value) VALUES ('registration_locked', 'false');
`);

export default db;
