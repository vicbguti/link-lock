import pkg from 'pg';
const { Pool } = pkg;

let pool;

export function initDb() {
  // Use DATABASE_URL from environment (Railway sets this automatically for PostgreSQL)
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  pool = new Pool({ connectionString });

  // Create tables
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      plan TEXT DEFAULT 'free',
      username TEXT UNIQUE,
      isPublic INTEGER DEFAULT 0,
      "createdAt" TEXT NOT NULL,
      "updatedAt" TEXT NOT NULL
    )`,
    
    `CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      url TEXT NOT NULL,
      screenshot BYTEA,
      title TEXT,
      folder TEXT DEFAULT 'default',
      "isPrivate" INTEGER DEFAULT 0,
      "createdAt" TEXT NOT NULL,
      "updatedAt" TEXT NOT NULL,
      FOREIGN KEY ("userId") REFERENCES users(id)
    )`,
    
    `CREATE INDEX IF NOT EXISTS idx_userId ON links("userId")`,
    `CREATE INDEX IF NOT EXISTS idx_folder ON links(folder)`,
    `CREATE INDEX IF NOT EXISTS idx_email ON users(email)`
  ];

  queries.forEach(query => {
    pool.query(query).catch(err => {
      if (!err.message.includes('already exists')) {
        console.error('Error creating table:', err);
      }
    });
  });
}

export async function getLinks(userId) {
  const result = await pool.query(
    `SELECT id, "userId", url, screenshot, title, folder, "isPrivate", "createdAt", "updatedAt"
     FROM links
     WHERE "userId" = $1
     ORDER BY "createdAt" DESC`,
    [userId]
  );

  return result.rows.map(link => ({
    ...link,
    isPrivate: link.isPrivate ? true : false,
    screenshot: link.screenshot ? link.screenshot.toString('base64') : null
  }));
}

export async function saveLink(link) {
  const now = new Date().toISOString();
  await pool.query(
    `INSERT INTO links (id, "userId", url, screenshot, title, folder, "isPrivate", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      link.id,
      link.userId,
      link.url,
      link.screenshot ? Buffer.from(link.screenshot, 'base64') : null,
      link.title,
      link.folder,
      link.isPrivate ? 1 : 0,
      link.createdAt,
      now
    ]
  );
}

export async function updateLinkFolder(linkId, folder) {
  await pool.query(
    `UPDATE links SET folder = $1, "updatedAt" = $2 WHERE id = $3`,
    [folder, new Date().toISOString(), linkId]
  );
}

export async function deleteLink(linkId) {
  await pool.query('DELETE FROM links WHERE id = $1', [linkId]);
}

export async function searchLinks(userId, query) {
  const searchQuery = `%${query}%`;
  const result = await pool.query(
    `SELECT id, "userId", url, screenshot, title, folder, "isPrivate", "createdAt", "updatedAt"
     FROM links
     WHERE "userId" = $1 AND (url ILIKE $2 OR title ILIKE $2)
     ORDER BY "createdAt" DESC`,
    [userId, searchQuery]
  );

  return result.rows.map(link => ({
    ...link,
    isPrivate: link.isPrivate ? true : false,
    screenshot: link.screenshot ? link.screenshot.toString('base64') : null
  }));
}

export async function createUser(id, email, passwordHash) {
  const now = new Date().toISOString();
  await pool.query(
    `INSERT INTO users (id, email, password, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5)`,
    [id, email, passwordHash, now, now]
  );
}

export async function getUserByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

export async function getUserById(id) {
  const result = await pool.query(
    'SELECT id, email, plan, username, "isPublic", "createdAt" FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

export async function getUserByUsername(username) {
  const result = await pool.query(
    'SELECT id, email, username, "isPublic", "createdAt" FROM users WHERE username = $1 AND "isPublic" = 1',
    [username]
  );
  return result.rows[0];
}

export async function getLinkCount(userId) {
  const result = await pool.query('SELECT COUNT(*) as count FROM links WHERE "userId" = $1', [userId]);
  return parseInt(result.rows[0].count);
}

export async function updateUserPlan(userId, plan) {
  await pool.query(
    'UPDATE users SET plan = $1, "updatedAt" = $2 WHERE id = $3',
    [plan, new Date().toISOString(), userId]
  );
}

export async function updateUserProfile(userId, username, isPublic) {
  await pool.query(
    'UPDATE users SET username = $1, "isPublic" = $2, "updatedAt" = $3 WHERE id = $4',
    [username, isPublic ? 1 : 0, new Date().toISOString(), userId]
  );
}

export async function getPublicUserLinks(username) {
  const result = await pool.query(
    `SELECT id, "userId", url, screenshot, title, folder, "createdAt"
     FROM links
     WHERE "userId" = (SELECT id FROM users WHERE username = $1 AND "isPublic" = 1)
     AND "isPrivate" = 0
     ORDER BY "createdAt" DESC`,
    [username]
  );

  return result.rows.map(link => ({
    ...link,
    screenshot: link.screenshot ? link.screenshot.toString('base64') : null
  }));
}

export async function toggleLinkPrivacy(linkId, isPrivate) {
  await pool.query(
    'UPDATE links SET "isPrivate" = $1, "updatedAt" = $2 WHERE id = $3',
    [isPrivate ? 1 : 0, new Date().toISOString(), linkId]
  );
}

export async function exportUserLinks(userId, format = 'json') {
  const links = await getLinks(userId);

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

export async function closeDb() {
  if (pool) {
    await pool.end();
  }
}
