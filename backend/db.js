const Database = require("better-sqlite3");

const db = new Database("siteaudit.db");

// Create table if not exists
db.prepare(`
CREATE TABLE IF NOT EXISTS audits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT,
  seoScore INTEGER,
  uxScore INTEGER,
  performanceScore INTEGER,
  mobileScore INTEGER,
  overallScore INTEGER,
  analysis TEXT,
  issues TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
`).run();

module.exports = db;