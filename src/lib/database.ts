import "server-only";
import path from "path";
import fs from "fs";

function findDbPath(): string {
  const candidates = [
    path.join(process.cwd(), "src", "data", "ecoterre.db"),
    path.join(process.cwd(), ".next", "src", "data", "ecoterre.db"),
    path.join(__dirname, "..", "..", "data", "ecoterre.db"),
    path.join(__dirname, "..", "..", "..", "src", "data", "ecoterre.db"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return candidates[0];
}

const DB_PATH = findDbPath();
const IS_VERCEL = process.env.VERCEL === "1";

let _db: DatabaseInstance | null = null;

type DatabaseInstance = {
  prepare: (sql: string) => {
    get: (...params: unknown[]) => unknown;
    all: (...params: unknown[]) => unknown[];
    run: (...params: unknown[]) => { changes: number };
  };
  exec: (sql: string) => void;
  pragma: (sql: string) => void;
  close: () => void;
};

function openLocalDb(): DatabaseInstance {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require("better-sqlite3");
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL,
      name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'author', avatar TEXT, bio TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, name_fr TEXT NOT NULL,
      name_ar TEXT NOT NULL, description_fr TEXT DEFAULT '', description_ar TEXT DEFAULT '',
      icon TEXT, sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title_fr TEXT NOT NULL,
      title_ar TEXT NOT NULL, content_fr TEXT NOT NULL, content_ar TEXT NOT NULL,
      excerpt_fr TEXT DEFAULT '', excerpt_ar TEXT DEFAULT '', cover_image TEXT,
      audio_url TEXT, video_url TEXT, pdf_url TEXT, author_id TEXT NOT NULL REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'draft', views INTEGER NOT NULL DEFAULT 0,
      reading_time INTEGER NOT NULL DEFAULT 0, is_featured INTEGER NOT NULL DEFAULT 0,
      published_at TEXT, scheduled_at TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS article_categories (
      article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      PRIMARY KEY (article_id, category_id)
    );
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL,
      name_fr TEXT NOT NULL, name_ar TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS article_tags (
      article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (article_id, tag_id)
    );
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY, article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      author_name TEXT NOT NULL, author_email TEXT NOT NULL, content TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS newsletters (
      id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL,
      subscribed INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, subject TEXT DEFAULT '',
      message TEXT NOT NULL, is_read INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY, filename TEXT NOT NULL, original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL, size INTEGER NOT NULL, url TEXT NOT NULL,
      alt_text TEXT DEFAULT '', uploaded_by TEXT REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS translations_cache (
      id TEXT PRIMARY KEY, article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      target_lang TEXT NOT NULL, content TEXT NOT NULL, title TEXT NOT NULL,
      excerpt TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(article_id, target_lang)
    );
    CREATE TABLE IF NOT EXISTS podcasts (
      id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title_fr TEXT NOT NULL,
      title_ar TEXT NOT NULL, description_fr TEXT DEFAULT '', description_ar TEXT DEFAULT '',
      audio_url TEXT, cover_image TEXT, author_id TEXT REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'draft', duration INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title_fr TEXT NOT NULL,
      title_ar TEXT NOT NULL, content_fr TEXT NOT NULL, content_ar TEXT NOT NULL,
      excerpt_fr TEXT DEFAULT '', excerpt_ar TEXT DEFAULT '', cover_image TEXT, pdf_url TEXT,
      author_id TEXT NOT NULL REFERENCES users(id), status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS views_log (
      id TEXT PRIMARY KEY, article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      ip_address TEXT, user_agent TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL, expires_at TEXT NOT NULL, used INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
    CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
    CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
    CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);
    CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
    CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
    CREATE INDEX IF NOT EXISTS idx_comments_article_id ON comments(article_id);
    CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
    CREATE INDEX IF NOT EXISTS idx_article_categories_category ON article_categories(category_id);
    CREATE INDEX IF NOT EXISTS idx_article_tags_tag ON article_tags(tag_id);
    CREATE INDEX IF NOT EXISTS idx_contacts_is_read ON contacts(is_read);
    CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media(uploaded_by);
    CREATE INDEX IF NOT EXISTS idx_newsletters_email ON newsletters(email);
    CREATE INDEX IF NOT EXISTS idx_views_log_article ON views_log(article_id);
  `);

  try { db.exec("ALTER TABLE articles ADD COLUMN video_url TEXT"); } catch {}
  try {
    const existingVideoCount = (db.prepare("SELECT COUNT(*) as c FROM articles WHERE video_url IS NOT NULL").get() as { c: number }).c;
    if (existingVideoCount === 0) {
      const videoIds = [
        "rzD5pR9wL4U", "M7lc1UVf-VE", "IP6Cq4J3WlI", "WZrOkfGFIq4",
        "2KZb2_vcNTg", "6Rl4z4gVgzE", "30o4omX5qfo", "xHkqj4oE7jQ",
        "ZXzuT5EwZFY", "n4t_-NjY_Sg", "9u7nS7O5Nps", "ciS8aCrQy88",
        "J6o8G7v0VgY", "z3hDWG5EUY4", "vQ3Mq0K3jGY",
      ];
      const articles = db.prepare("SELECT id FROM articles").all() as { id: string }[];
      const stmt = db.prepare("UPDATE articles SET video_url = ? WHERE id = ?");
      for (const article of articles) {
        if (Math.random() < 0.25) {
          const vid = videoIds[Math.floor(Math.random() * videoIds.length)];
          stmt.run(`https://www.youtube.com/watch?v=${vid}`, article.id);
        }
      }
    }
  } catch { /* migration may fail on Vercel */ }

  return db;
}

function openVercelDb(): DatabaseInstance | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require("better-sqlite3");
    if (!fs.existsSync(DB_PATH)) return null;
    const db = new Database(DB_PATH, { readonly: true });
    db.pragma("journal_mode = OFF");
    db.pragma("foreign_keys = ON");
    db.pragma("query_only = true");
    return db;
  } catch (e) {
    console.error("Failed to open database on Vercel:", e);
    return null;
  }
}

export function getDb(): DatabaseInstance {
  if (_db) {
    try {
      _db.prepare("SELECT 1").get();
      return _db;
    } catch {
      _db = null;
    }
  }

  if (IS_VERCEL) {
    const db = openVercelDb();
    if (db) {
      _db = db;
      return _db;
    }
    throw new Error("Database not available in this environment.");
  }

  _db = openLocalDb();
  return _db;
}

export function closeDb(): void {
  if (_db) {
    try { _db.close(); } catch { /* ignore */ }
    _db = null;
  }
}

export function isVercel(): boolean {
  return IS_VERCEL;
}
