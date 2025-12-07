#!/usr/bin/env node
/**
 * Migration script: SQLite → PostgreSQL
 * Usage: DATABASE_URL=postgresql://user:pass@host/db node migrate-to-postgres.js
 */

import Database from 'better-sqlite3';
import pkg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pkg;

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqliteDbPath = join(__dirname, 'packages/api/data/linklock.db');

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not set. Usage: DATABASE_URL=postgresql://... node migrate-to-postgres.js');
    process.exit(1);
  }

  console.log('🔄 Starting migration: SQLite → PostgreSQL...\n');

  // Open SQLite database
  let sqlite;
  try {
    sqlite = new Database(sqliteDbPath);
    console.log('✅ Connected to SQLite database');
  } catch (err) {
    console.error('❌ Failed to open SQLite database:', err.message);
    process.exit(1);
  }

  // Connect to PostgreSQL
  const pgPool = new Pool({ connectionString: databaseUrl });
  
  try {
    console.log('✅ Connected to PostgreSQL');

    // Create tables in PostgreSQL
    const createTableQueries = [
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        plan TEXT DEFAULT 'free',
        username TEXT UNIQUE,
        "isPublic" INTEGER DEFAULT 0,
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

    for (const query of createTableQueries) {
      try {
        await pgPool.query(query);
      } catch (err) {
        if (!err.message.includes('already exists') && !err.message.includes('UNIQUE constraint')) {
          throw err;
        }
      }
    }

    console.log('✅ Tables created in PostgreSQL\n');

    // Migrate users
    const users = sqlite.prepare('SELECT * FROM users').all();
    console.log(`📦 Found ${users.length} users to migrate`);

    for (const user of users) {
      await pgPool.query(
        `INSERT INTO users (id, email, password, plan, username, "isPublic", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [user.id, user.email, user.password, user.plan, user.username || null, user.isPublic || 0, user.createdAt, user.updatedAt]
      );
    }

    console.log(`✅ Migrated ${users.length} users\n`);

    // Migrate links
    const links = sqlite.prepare('SELECT * FROM links').all();
    console.log(`📦 Found ${links.length} links to migrate`);

    for (const link of links) {
      await pgPool.query(
        `INSERT INTO links (id, "userId", url, screenshot, title, folder, "isPrivate", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [
          link.id,
          link.userId,
          link.url,
          link.screenshot,
          link.title,
          link.folder,
          link.isPrivate || 0,
          link.createdAt,
          link.updatedAt
        ]
      );
    }

    console.log(`✅ Migrated ${links.length} links\n`);

    // Verify counts
    const pgUserCount = await pgPool.query('SELECT COUNT(*) FROM users');
    const pgLinkCount = await pgPool.query('SELECT COUNT(*) FROM links');

    console.log('📊 Migration Summary:');
    console.log(`   Users: ${pgUserCount.rows[0].count}/${users.length}`);
    console.log(`   Links: ${pgLinkCount.rows[0].count}/${links.length}`);
    console.log('\n✅ Migration completed successfully!');

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    sqlite.close();
    await pgPool.end();
  }
}

migrate();
