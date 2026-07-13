import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { hashSync } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const DB_PATH = path.join(process.cwd(), "src", "data", "ecoterre.db");
const DATA_DIR = path.join(process.cwd(), "src", "data");

function readJSON<T>(filename: string): T[] {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T[];
}

function seed() {
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
  }

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'author',
      avatar TEXT,
      bio TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name_fr TEXT NOT NULL,
      name_ar TEXT NOT NULL,
      description_fr TEXT DEFAULT '',
      description_ar TEXT DEFAULT '',
      icon TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title_fr TEXT NOT NULL,
      title_ar TEXT NOT NULL,
      content_fr TEXT NOT NULL,
      content_ar TEXT NOT NULL,
      excerpt_fr TEXT DEFAULT '',
      excerpt_ar TEXT DEFAULT '',
      cover_image TEXT,
      audio_url TEXT,
      pdf_url TEXT,
      author_id TEXT NOT NULL REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'draft',
      views INTEGER NOT NULL DEFAULT 0,
      reading_time INTEGER NOT NULL DEFAULT 0,
      is_featured INTEGER NOT NULL DEFAULT 0,
      published_at TEXT,
      scheduled_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS article_categories (
      article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      PRIMARY KEY (article_id, category_id)
    );

    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name_fr TEXT NOT NULL,
      name_ar TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS article_tags (
      article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (article_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      author_name TEXT NOT NULL,
      author_email TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS newsletters (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      subscribed INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT DEFAULT '',
      message TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      url TEXT NOT NULL,
      alt_text TEXT DEFAULT '',
      uploaded_by TEXT REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS translations_cache (
      id TEXT PRIMARY KEY,
      article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      target_lang TEXT NOT NULL,
      content TEXT NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(article_id, target_lang)
    );

    CREATE TABLE IF NOT EXISTS podcasts (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title_fr TEXT NOT NULL,
      title_ar TEXT NOT NULL,
      description_fr TEXT DEFAULT '',
      description_ar TEXT DEFAULT '',
      audio_url TEXT,
      cover_image TEXT,
      author_id TEXT REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'draft',
      duration INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title_fr TEXT NOT NULL,
      title_ar TEXT NOT NULL,
      content_fr TEXT NOT NULL,
      content_ar TEXT NOT NULL,
      excerpt_fr TEXT DEFAULT '',
      excerpt_ar TEXT DEFAULT '',
      cover_image TEXT,
      pdf_url TEXT,
      author_id TEXT NOT NULL REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS views_log (
      id TEXT PRIMARY KEY,
      article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
    CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
    CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
    CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);
    CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
    CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
  `);

  const insertUser = db.prepare(
    `INSERT INTO users (id, email, password, name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  const hashedPassword = hashSync("ecoterre2026", 10);

  const existingUsers = readJSON<{
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
  }>("users");

  for (const u of existingUsers) {
    insertUser.run(
      u.id,
      u.email,
      hashedPassword,
      u.name,
      u.role,
      u.createdAt,
      u.createdAt
    );
  }

  console.log(`Seeded ${existingUsers.length} users`);

  const insertCategory = db.prepare(
    `INSERT INTO categories (id, slug, name_fr, name_ar, description_fr, description_ar, icon, sort_order, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const existingCategories = readJSON<{
    id: string;
    slug: string;
    name: { fr: string; ar: string };
    description: { fr: string; ar: string };
    icon?: string;
    order: number;
  }>("categories");

  for (const c of existingCategories) {
    insertCategory.run(
      c.id,
      c.slug,
      c.name.fr,
      c.name.ar,
      c.description.fr,
      c.description.ar,
      c.icon ?? null,
      c.order,
      new Date().toISOString()
    );
  }

  console.log(`Seeded ${existingCategories.length} categories`);

  const insertArticle = db.prepare(
    `INSERT INTO articles (id, slug, title_fr, title_ar, content_fr, content_ar, excerpt_fr, excerpt_ar, cover_image, author_id, status, published_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const insertArticleCategory = db.prepare(
    `INSERT INTO article_categories (article_id, category_id) VALUES (?, ?)`
  );

  const existingArticles = readJSON<{
    id: string;
    slug: string;
    title: { fr: string; ar: string };
    content: { fr: string; ar: string };
    excerpt: { fr: string; ar: string };
    coverImage?: string;
    categoryIds: string[];
    authorId: string;
    status: string;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
  }>("articles");

  for (const a of existingArticles) {
    insertArticle.run(
      a.id,
      a.slug,
      a.title.fr,
      a.title.ar,
      a.content.fr,
      a.content.ar,
      a.excerpt.fr,
      a.excerpt.ar,
      a.coverImage ?? null,
      a.authorId,
      a.status,
      a.publishedAt ?? null,
      a.createdAt,
      a.updatedAt
    );

    for (const catId of a.categoryIds) {
      insertArticleCategory.run(a.id, catId);
    }
  }

  console.log(`Seeded ${existingArticles.length} articles`);

  const insertTag = db.prepare(
    `INSERT INTO tags (id, slug, name_fr, name_ar, created_at) VALUES (?, ?, ?, ?, ?)`
  );

  const initialTags = [
    {
      slug: "tunisie",
      name: { fr: "Tunisie", ar: "تونس" },
    },
    {
      slug: "developpement-durable",
      name: {
        fr: "Développement durable",
        ar: "تنمية مستدامة",
      },
    },
    {
      slug: "climat",
      name: { fr: "Climat", ar: "مناخ" },
    },
    {
      slug: "investissement",
      name: { fr: "Investissement", ar: "استثمار" },
    },
    {
      slug: "agriculture",
      name: { fr: "Agriculture", ar: "فلاحة" },
    },
  ];

  for (const tag of initialTags) {
    insertTag.run(
      uuidv4(),
      tag.slug,
      tag.name.fr,
      tag.name.ar,
      new Date().toISOString()
    );
  }

  console.log(`Seeded ${initialTags.length} tags`);

  const existingTranslations = readJSON<{
    articleId: string;
    targetLang: string;
    content: string;
    title: string;
    excerpt: string;
    createdAt: string;
  }>("translations");

  if (existingTranslations.length > 0) {
    const insertTranslation = db.prepare(
      `INSERT OR IGNORE INTO translations_cache (id, article_id, target_lang, content, title, excerpt, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    for (const t of existingTranslations) {
      insertTranslation.run(
        uuidv4(),
        t.articleId,
        t.targetLang,
        t.content,
        t.title,
        t.excerpt,
        t.createdAt
      );
    }
    console.log(`Seeded ${existingTranslations.length} translations`);
  }

  const settings = db.prepare(
    `INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)`
  );

  settings.run("site_name", "Ecoterre", new Date().toISOString());
  settings.run(
    "site_description",
    "Portail d'actualités sur l'environnement et le développement durable en Tunisie",
    new Date().toISOString()
  );

  console.log("Seeded initial settings");
  console.log("Database seeded successfully!");

  db.close();
}

seed();
