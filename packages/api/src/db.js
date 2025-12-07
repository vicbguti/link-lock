import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');
const dbPath = join(dataDir, 'linklock.db');

let db;

export function initDb() {
  mkdirSync(dataDir, { recursive: true });
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  // Check if tables exist and migrate if needed
  try {
    const linksInfo = db.prepare("PRAGMA table_info(links)").all();
    const hasIsPrivate = linksInfo.some(col => col.name === 'isPrivate');
    
    if (!hasIsPrivate) {
      console.log('Adding isPrivate column to links table...');
      db.exec('ALTER TABLE links ADD COLUMN isPrivate INTEGER DEFAULT 0');
    }
    
    const usersInfo = db.prepare("PRAGMA table_info(users)").all();
    const hasUsername = usersInfo.some(col => col.name === 'username');
    const hasIsPublic = usersInfo.some(col => col.name === 'isPublic');
    
    if (!hasUsername) {
      console.log('Adding username column to users table...');
      db.exec('ALTER TABLE users ADD COLUMN username TEXT UNIQUE');
    }
    if (!hasIsPublic) {
      console.log('Adding isPublic column to users table...');
      db.exec('ALTER TABLE users ADD COLUMN isPublic INTEGER DEFAULT 0');
    }
  } catch (e) {
    // Tables don't exist yet, will be created below
  }

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      plan TEXT DEFAULT 'free',
      username TEXT UNIQUE,
      isPublic INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      url TEXT NOT NULL,
      screenshot BLOB,
      title TEXT,
      folder TEXT DEFAULT 'default',
      isPrivate INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_userId ON links(userId);
    CREATE INDEX IF NOT EXISTS idx_folder ON links(folder);
    CREATE INDEX IF NOT EXISTS idx_email ON users(email);
  `);
}

export function getLinks(userId) {
  const stmt = db.prepare(`
    SELECT id, userId, url, screenshot, title, folder, isPrivate, createdAt, updatedAt
    FROM links
    WHERE userId = ?
    ORDER BY createdAt DESC
  `);
  
  const links = stmt.all(userId);
  
  // Convert screenshot buffers to base64
  return links.map(link => ({
    ...link,
    isPrivate: link.isPrivate ? true : false,
    screenshot: link.screenshot ? link.screenshot.toString('base64') : null
  }));
}

export function saveLink(link) {
  const stmt = db.prepare(`
    INSERT INTO links (id, userId, url, screenshot, title, folder, isPrivate, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();
  stmt.run(
    link.id,
    link.userId,
    link.url,
    link.screenshot ? Buffer.from(link.screenshot, 'base64') : null,
    link.title,
    link.folder,
    link.isPrivate ? 1 : 0,
    link.createdAt,
    now
  );
}

export function updateLinkFolder(linkId, folder) {
  const stmt = db.prepare(`
    UPDATE links
    SET folder = ?, updatedAt = ?
    WHERE id = ?
  `);

  stmt.run(folder, new Date().toISOString(), linkId);
}

export function deleteLink(linkId) {
  const stmt = db.prepare('DELETE FROM links WHERE id = ?');
  stmt.run(linkId);
}

export function searchLinks(userId, query) {
  const stmt = db.prepare(`
    SELECT id, userId, url, screenshot, title, folder, isPrivate, createdAt, updatedAt
    FROM links
    WHERE userId = ? AND (url LIKE ? OR title LIKE ?)
    ORDER BY createdAt DESC
  `);

  const searchQuery = `%${query}%`;
  const links = stmt.all(userId, searchQuery, searchQuery);
  
  // Convert screenshot buffers to base64
  return links.map(link => ({
    ...link,
    isPrivate: link.isPrivate ? true : false,
    screenshot: link.screenshot ? link.screenshot.toString('base64') : null
  }));
}

// User functions
export function createUser(id, email, passwordHash) {
  const stmt = db.prepare(`
    INSERT INTO users (id, email, password, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const now = new Date().toISOString();
  stmt.run(id, email, passwordHash, now, now);
}

export function getUserByEmail(email) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email);
}

export function getUserById(id) {
  const stmt = db.prepare('SELECT id, email, plan, createdAt FROM users WHERE id = ?');
  const user = stmt.get(id);
  
  // Try to get username and isPublic if columns exist
  try {
    const fullStmt = db.prepare('SELECT username, isPublic FROM users WHERE id = ?');
    const extra = fullStmt.get(id);
    if (extra) {
      return { ...user, username: extra.username, isPublic: extra.isPublic };
    }
  } catch (e) {
    // Columns don't exist yet, return basic user
  }
  
  return user;
}

export function getUserByUsername(username) {
  const stmt = db.prepare('SELECT id, email, username, isPublic, createdAt FROM users WHERE username = ? AND isPublic = 1');
  return stmt.get(username);
}

export function getLinkCount(userId) {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM links WHERE userId = ?');
  return stmt.get(userId).count;
}

export function updateUserPlan(userId, plan) {
  const stmt = db.prepare(`
    UPDATE users SET plan = ?, updatedAt = ? WHERE id = ?
  `);
  
  stmt.run(plan, new Date().toISOString(), userId);
}

export function updateUserProfile(userId, username, isPublic) {
  try {
    const stmt = db.prepare(`
      UPDATE users SET username = ?, isPublic = ?, updatedAt = ? WHERE id = ?
    `);
    
    stmt.run(username, isPublic ? 1 : 0, new Date().toISOString(), userId);
  } catch (e) {
    if (e.message.includes('no such column')) {
      // Columns don't exist yet, skip
      console.warn('Username/isPublic columns not yet available');
    } else {
      throw e;
    }
  }
}

export function getPublicUserLinks(username) {
  try {
    const stmt = db.prepare(`
      SELECT id, userId, url, screenshot, title, folder, createdAt
      FROM links
      WHERE userId = (SELECT id FROM users WHERE username = ? AND isPublic = 1)
      AND isPrivate = 0
      ORDER BY createdAt DESC
    `);
    
    const links = stmt.all(username);
    
    // Convert screenshot buffers to base64
    return links.map(link => ({
      ...link,
      screenshot: link.screenshot ? link.screenshot.toString('base64') : null
    }));
  } catch (e) {
    if (e.message.includes('no such column')) {
      return [];
    }
    throw e;
  }
}

export function toggleLinkPrivacy(linkId, isPrivate) {
  const stmt = db.prepare(`
    UPDATE links SET isPrivate = ?, updatedAt = ? WHERE id = ?
  `);
  
  stmt.run(isPrivate ? 1 : 0, new Date().toISOString(), linkId);
}

export function exportUserLinks(userId, format = 'json') {
  const links = getLinks(userId);
  
  if (format === 'csv') {
    const headers = ['URL', 'Title', 'Folder', 'Date', 'Private'];
    const rows = links.map(l => [
      l.url,
      l.title,
      l.folder,
      new Date(l.createdAt).toLocaleDateString(),
      l.isPrivate ? 'Yes' : 'No'
    ]);
    
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    return csv;
  }
  
  return JSON.stringify(links, null, 2);
}
