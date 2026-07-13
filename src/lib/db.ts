import "server-only";
import { getDb } from "./database";
import { v4 as uuidv4 } from "uuid";
import type { Article } from "./types";
import type { Category } from "./types";
import type { User } from "./types";
import type { ContactMessage } from "./types";
import type {
  ArticleRow,
  CategoryRow,
  UserRow,
  TagRow,
  CommentRow,
  ContactRow,
  NewsletterRow,
  MediaRow,
} from "./db-types";

const ORDER_BY_RE = /^[a-zA-Z_][a-zA-Z0-9_]*(?:\s+(?:ASC|DESC))?(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*(?:\s+(?:ASC|DESC))?)*$/;

function safeOrderBy(value: string): string {
  if (!value || !ORDER_BY_RE.test(value.trim())) {
    return "created_at DESC";
  }
  return value.trim();
}

interface QueryOptions {
  where?: Record<string, unknown>;
  orderBy?: string;
  limit?: number;
  offset?: number;
}

function mapArticleRow(row: ArticleRow): Article {
  const db = getDb();
  const catRows = db
    .prepare(
      `SELECT category_id FROM article_categories WHERE article_id = ?`
    )
    .all(row.id) as { category_id: string }[];
  const categoryIds = catRows.map((c) => c.category_id);

  const tagRows = db
    .prepare(
      `SELECT tag_id FROM article_tags WHERE article_id = ?`
    )
    .all(row.id) as { tag_id: string }[];
  const tagIds = tagRows.map((t) => t.tag_id);

  const authorRow = db
    .prepare(`SELECT name FROM users WHERE id = ?`)
    .get(row.author_id) as { name: string } | undefined;

  return {
    id: row.id,
    slug: row.slug,
    title: { fr: row.title_fr, ar: row.title_ar },
    content: { fr: row.content_fr, ar: row.content_ar },
    excerpt: { fr: row.excerpt_fr, ar: row.excerpt_ar },
    coverImage: row.cover_image ?? undefined,
    categoryIds,
    tagIds: tagIds.length > 0 ? tagIds : undefined,
    authorId: row.author_id,
    authorName: authorRow?.name,
    status: row.status as "draft" | "published",
    views: row.views ?? 0,
    readingTime: row.reading_time ?? 0,
    isFeatured: row.is_featured === 1,
    audioUrl: row.audio_url ?? undefined,
    pdfUrl: row.pdf_url ?? undefined,
    publishedAt: row.published_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCategoryRow(row: CategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: { fr: row.name_fr, ar: row.name_ar },
    description: { fr: row.description_fr, ar: row.description_ar },
    icon: row.icon ?? undefined,
    order: row.sort_order,
  };
}

function mapUserRow(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    password: row.password,
    name: row.name,
    role: row.role as "admin" | "author",
    avatar: row.avatar ?? undefined,
    bio: row.bio ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapContactRow(row: ContactRow): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    createdAt: row.created_at,
    read: row.is_read === 1,
  };
}

function buildWhereClause(
  where: Record<string, unknown>
): { clause: string; params: unknown[] } {
  const conditions: string[] = [];
  const params: unknown[] = [];
  for (const [key, value] of Object.entries(where)) {
    if (value !== undefined && value !== null) {
      conditions.push(`"${key}" = ?`);
      params.push(value);
    }
  }
  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
}

export function findAll<T>(
  table: string,
  options?: QueryOptions
): T[] {
  const db = getDb();
  const { clause, params } = buildWhereClause(options?.where ?? {});
  let sql = `SELECT * FROM "${table}" ${clause}`;

  if (options?.orderBy) {
    sql += ` ORDER BY ${safeOrderBy(options.orderBy)}`;
  }

  if (options?.limit !== undefined) {
    sql += ` LIMIT ?`;
    params.push(options.limit);
  }

  if (options?.offset !== undefined) {
    sql += ` OFFSET ?`;
    params.push(options.offset);
  }

  if (table === "articles") {
    const rows = db.prepare(sql).all(...params) as ArticleRow[];
    return rows.map((r) => mapArticleRow(r)) as unknown as T[];
  }

  if (table === "categories") {
    const rows = db.prepare(sql).all(...params) as CategoryRow[];
    return rows.map((r) => mapCategoryRow(r)) as unknown as T[];
  }

  if (table === "users") {
    const rows = db.prepare(sql).all(...params) as UserRow[];
    return rows.map((r) => mapUserRow(r)) as unknown as T[];
  }

  if (table === "contacts") {
    const rows = db.prepare(sql).all(...params) as ContactRow[];
    return rows.map((r) => mapContactRow(r)) as unknown as T[];
  }

  return db.prepare(sql).all(...params) as T[];
}

export function findById<T>(
  table: string,
  id: string
): T | undefined {
  const db = getDb();

  if (table === "articles") {
    const row = db
      .prepare(`SELECT * FROM articles WHERE id = ?`)
      .get(id) as ArticleRow | undefined;
    return row ? (mapArticleRow(row) as unknown as T) : undefined;
  }

  if (table === "categories") {
    const row = db
      .prepare(`SELECT * FROM categories WHERE id = ?`)
      .get(id) as CategoryRow | undefined;
    return row ? (mapCategoryRow(row) as unknown as T) : undefined;
  }

  if (table === "users") {
    const row = db
      .prepare(`SELECT * FROM users WHERE id = ?`)
      .get(id) as UserRow | undefined;
    return row ? (mapUserRow(row) as unknown as T) : undefined;
  }

  const row = db
    .prepare(`SELECT * FROM "${table}" WHERE id = ?`)
    .get(id) as T | undefined;
  return row;
}

export function findBy<T>(
  table: string,
  key: string,
  value: unknown
): T | undefined {
  const db = getDb();

  if (table === "users") {
    const row = db
      .prepare(`SELECT * FROM users WHERE "${key}" = ?`)
      .get(value) as UserRow | undefined;
    return row ? (mapUserRow(row) as unknown as T) : undefined;
  }

  if (table === "articles" && key === "slug") {
    const row = db
      .prepare(`SELECT * FROM articles WHERE slug = ?`)
      .get(value) as ArticleRow | undefined;
    return row ? (mapArticleRow(row) as unknown as T) : undefined;
  }

  if (table === "categories" && key === "slug") {
    const row = db
      .prepare(`SELECT * FROM categories WHERE slug = ?`)
      .get(value) as CategoryRow | undefined;
    return row ? (mapCategoryRow(row) as unknown as T) : undefined;
  }

  const row = db
    .prepare(`SELECT * FROM "${table}" WHERE "${key}" = ?`)
    .get(value) as T | undefined;
  return row;
}

export function findAllBy<T>(
  table: string,
  filter: Record<string, unknown>
): T[] {
  return findAll<T>(table, { where: filter });
}

export function insert(
  table: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> {
  const db = getDb();

  if (table === "articles") {
    return insertArticle(db, data);
  }

  if (table === "categories") {
    return insertCategory(db, data);
  }

  if (table === "users") {
    return insertUser(db, data);
  }

  if (table === "contacts") {
    return insertContact(db, data);
  }

  const keys = Object.keys(data);
  const placeholders = keys.map(() => "?").join(", ");
  const values = keys.map((k) => data[k]);
  const quotedKeys = keys.map((k) => `"${k}"`).join(", ");

  db.prepare(
    `INSERT INTO "${table}" (${quotedKeys}) VALUES (${placeholders})`
  ).run(...values);

  return data;
}

function insertArticle(
  db: ReturnType<typeof getDb>,
  data: Record<string, unknown>
): Record<string, unknown> {
  const titleFr =
    (data.title as Record<string, string> | undefined)?.fr ?? "";
  const titleAr =
    (data.title as Record<string, string> | undefined)?.ar ?? "";
  const contentFr =
    (data.content as Record<string, string> | undefined)?.fr ?? "";
  const contentAr =
    (data.content as Record<string, string> | undefined)?.ar ?? "";
  const excerptFr =
    (data.excerpt as Record<string, string> | undefined)?.fr ?? "";
  const excerptAr =
    (data.excerpt as Record<string, string> | undefined)?.ar ?? "";

  db.prepare(
    `INSERT INTO articles (id, slug, title_fr, title_ar, content_fr, content_ar, excerpt_fr, excerpt_ar, cover_image, audio_url, pdf_url, author_id, status, views, reading_time, is_featured, published_at, scheduled_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    data.id,
    data.slug,
    titleFr,
    titleAr,
    contentFr,
    contentAr,
    excerptFr,
    excerptAr,
    data.coverImage ?? null,
    data.audioUrl ?? null,
    data.pdfUrl ?? null,
    data.authorId,
    data.status ?? "draft",
    data.views ?? 0,
    data.readingTime ?? 0,
    data.isFeatured ?? 0,
    data.publishedAt ?? null,
    data.scheduledAt ?? null,
    data.createdAt ?? new Date().toISOString(),
    data.updatedAt ?? new Date().toISOString()
  );

  const categoryIds = (data.categoryIds ?? []) as string[];
  if (categoryIds.length > 0) {
    const insertCat = db.prepare(
      `INSERT OR IGNORE INTO article_categories (article_id, category_id) VALUES (?, ?)`
    );
    for (const catId of categoryIds) {
      insertCat.run(data.id, catId);
    }
  }

  const tagIds = (data.tagIds ?? []) as string[];
  if (tagIds.length > 0) {
    const insertTag = db.prepare(
      `INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)`
    );
    for (const tagId of tagIds) {
      insertTag.run(data.id, tagId);
    }
  }

  return data;
}

function insertCategory(
  db: ReturnType<typeof getDb>,
  data: Record<string, unknown>
): Record<string, unknown> {
  const nameFr =
    (data.name as Record<string, string> | undefined)?.fr ?? "";
  const nameAr =
    (data.name as Record<string, string> | undefined)?.ar ?? "";
  const descFr =
    (data.description as Record<string, string> | undefined)?.fr ?? "";
  const descAr =
    (data.description as Record<string, string> | undefined)?.ar ?? "";

  db.prepare(
    `INSERT INTO categories (id, slug, name_fr, name_ar, description_fr, description_ar, icon, sort_order, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    data.id,
    data.slug,
    nameFr,
    nameAr,
    descFr,
    descAr,
    data.icon ?? null,
    data.order ?? 0,
    new Date().toISOString()
  );

  return data;
}

function insertUser(
  db: ReturnType<typeof getDb>,
  data: Record<string, unknown>
): Record<string, unknown> {
  const now = (data.createdAt as string) ?? new Date().toISOString();
  db.prepare(
    `INSERT INTO users (id, email, password, name, role, avatar, bio, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    data.id,
    data.email,
    data.password,
    data.name,
    data.role ?? "author",
    data.avatar ?? null,
    data.bio ?? null,
    now,
    now
  );

  return data;
}

function insertContact(
  db: ReturnType<typeof getDb>,
  data: Record<string, unknown>
): Record<string, unknown> {
  db.prepare(
    `INSERT INTO contacts (id, name, email, subject, message, is_read, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    data.id,
    data.name,
    data.email,
    data.subject ?? "",
    data.message,
    data.is_read ?? 0,
    data.created_at ?? new Date().toISOString()
  );

  return data;
}

export function update(
  table: string,
  id: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> | undefined {
  const db = getDb();

  if (table === "articles") {
    return updateArticle(db, id, data);
  }

  if (table === "categories") {
    return updateCategory(db, id, data);
  }

  if (table === "users") {
    return updateUser(db, id, data);
  }

  const existing = db
    .prepare(`SELECT * FROM "${table}" WHERE id = ?`)
    .get(id) as Record<string, unknown> | undefined;
  if (!existing) return undefined;

  const keys = Object.keys(data);
  if (keys.length === 0) return existing;

  const setClauses = keys.map((k) => `"${k}" = ?`).join(", ");
  const values = keys.map((k) => data[k]);

  db.prepare(
    `UPDATE "${table}" SET ${setClauses} WHERE id = ?`
  ).run(...values, id);

  return db
    .prepare(`SELECT * FROM "${table}" WHERE id = ?`)
    .get(id) as Record<string, unknown>;
}

function updateArticle(
  db: ReturnType<typeof getDb>,
  id: string,
  data: Record<string, unknown>
): Record<string, unknown> | undefined {
  const existing = db
    .prepare(`SELECT * FROM articles WHERE id = ?`)
    .get(id) as ArticleRow | undefined;
  if (!existing) return undefined;

  const updates: Record<string, unknown> = {};

  if (data.title !== undefined) {
    const t = data.title as Record<string, string>;
    updates.title_fr = t.fr ?? existing.title_fr;
    updates.title_ar = t.ar ?? existing.title_ar;
  }
  if (data.content !== undefined) {
    const c = data.content as Record<string, string>;
    updates.content_fr = c.fr ?? existing.content_fr;
    updates.content_ar = c.ar ?? existing.content_ar;
  }
  if (data.excerpt !== undefined) {
    const e = data.excerpt as Record<string, string>;
    updates.excerpt_fr = e.fr ?? existing.excerpt_fr;
    updates.excerpt_ar = e.ar ?? existing.excerpt_ar;
  }
  if (data.slug !== undefined) updates.slug = data.slug;
  if (data.coverImage !== undefined) updates.cover_image = data.coverImage;
  if (data.audioUrl !== undefined) updates.audio_url = data.audioUrl;
  if (data.pdfUrl !== undefined) updates.pdf_url = data.pdfUrl;
  if (data.authorId !== undefined) updates.author_id = data.authorId;
  if (data.status !== undefined) updates.status = data.status;
  if (data.views !== undefined) updates.views = data.views;
  if (data.readingTime !== undefined) updates.reading_time = data.readingTime;
  if (data.isFeatured !== undefined) updates.is_featured = data.isFeatured;
  if (data.publishedAt !== undefined) updates.published_at = data.publishedAt;
  if (data.scheduledAt !== undefined) updates.scheduled_at = data.scheduledAt;
  if (data.updatedAt !== undefined) updates.updated_at = data.updatedAt;

  const keys = Object.keys(updates);
  if (keys.length > 0) {
    const setClauses = keys.map((k) => `"${k}" = ?`).join(", ");
    const values = keys.map((k) => updates[k]);
    db.prepare(`UPDATE articles SET ${setClauses} WHERE id = ?`).run(
      ...values,
      id
    );
  }

  if (data.categoryIds !== undefined) {
    db.prepare(`DELETE FROM article_categories WHERE article_id = ?`).run(id);
    const categoryIds = data.categoryIds as string[];
    if (categoryIds.length > 0) {
      const insertCat = db.prepare(
        `INSERT OR IGNORE INTO article_categories (article_id, category_id) VALUES (?, ?)`
      );
      for (const catId of categoryIds) {
        insertCat.run(id, catId);
      }
    }
  }

  if (data.tagIds !== undefined) {
    db.prepare(`DELETE FROM article_tags WHERE article_id = ?`).run(id);
    const tagIds = data.tagIds as string[];
    if (tagIds.length > 0) {
      const insertTag = db.prepare(
        `INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)`
      );
      for (const tagId of tagIds) {
        insertTag.run(id, tagId);
      }
    }
  }

  const updated = db
    .prepare(`SELECT * FROM articles WHERE id = ?`)
    .get(id) as ArticleRow;
  return mapArticleRow(updated) as unknown as Record<string, unknown>;
}

function updateCategory(
  db: ReturnType<typeof getDb>,
  id: string,
  data: Record<string, unknown>
): Record<string, unknown> | undefined {
  const existing = db
    .prepare(`SELECT * FROM categories WHERE id = ?`)
    .get(id) as CategoryRow | undefined;
  if (!existing) return undefined;

  const updates: Record<string, unknown> = {};

  if (data.name !== undefined) {
    const n = data.name as Record<string, string>;
    updates.name_fr = n.fr ?? existing.name_fr;
    updates.name_ar = n.ar ?? existing.name_ar;
  }
  if (data.description !== undefined) {
    const d = data.description as Record<string, string>;
    updates.description_fr = d.fr ?? existing.description_fr;
    updates.description_ar = d.ar ?? existing.description_ar;
  }
  if (data.slug !== undefined) updates.slug = data.slug;
  if (data.icon !== undefined) updates.icon = data.icon;
  if (data.order !== undefined) updates.sort_order = data.order;

  const keys = Object.keys(updates);
  if (keys.length > 0) {
    const setClauses = keys.map((k) => `"${k}" = ?`).join(", ");
    const values = keys.map((k) => updates[k]);
    db.prepare(`UPDATE categories SET ${setClauses} WHERE id = ?`).run(
      ...values,
      id
    );
  }

  const updated = db
    .prepare(`SELECT * FROM categories WHERE id = ?`)
    .get(id) as CategoryRow;
  return mapCategoryRow(updated) as unknown as Record<string, unknown>;
}

function updateUser(
  db: ReturnType<typeof getDb>,
  id: string,
  data: Record<string, unknown>
): Record<string, unknown> | undefined {
  const existing = db
    .prepare(`SELECT * FROM users WHERE id = ?`)
    .get(id) as UserRow | undefined;
  if (!existing) return undefined;

  const updates: Record<string, unknown> = {};
  if (data.email !== undefined) updates.email = data.email;
  if (data.password !== undefined) updates.password = data.password;
  if (data.name !== undefined) updates.name = data.name;
  if (data.role !== undefined) updates.role = data.role;
  if (data.avatar !== undefined) updates.avatar = data.avatar;
  if (data.bio !== undefined) updates.bio = data.bio;
  if (data.createdAt !== undefined) updates.created_at = data.createdAt;
  updates.updated_at = new Date().toISOString();

  const keys = Object.keys(updates);
  if (keys.length > 0) {
    const setClauses = keys.map((k) => `"${k}" = ?`).join(", ");
    const values = keys.map((k) => updates[k]);
    db.prepare(`UPDATE users SET ${setClauses} WHERE id = ?`).run(
      ...values,
      id
    );
  }

  const updated = db
    .prepare(`SELECT * FROM users WHERE id = ?`)
    .get(id) as UserRow;
  return mapUserRow(updated) as unknown as Record<string, unknown>;
}

export function remove(table: string, id: string): boolean {
  const db = getDb();
  const result = db
    .prepare(`DELETE FROM "${table}" WHERE id = ?`)
    .run(id);
  return result.changes > 0;
}

export function searchArticles(
  query: string,
  locale?: string,
  options?: QueryOptions
): Article[] {
  const db = getDb();
  const like = `%${query}%`;

  const frFields = `(title_fr LIKE ? OR content_fr LIKE ? OR excerpt_fr LIKE ?)`;
  const arFields = `(title_ar LIKE ? OR content_ar LIKE ? OR excerpt_ar LIKE ?)`;

  let sql: string;
  let params: unknown[];

  if (locale === "ar") {
    sql = `SELECT * FROM articles WHERE ${arFields}`;
    params = [like, like, like];
  } else if (locale === "fr") {
    sql = `SELECT * FROM articles WHERE ${frFields}`;
    params = [like, like, like];
  } else {
    sql = `SELECT * FROM articles WHERE ${frFields} OR ${arFields}`;
    params = [like, like, like, like, like, like];
  }

  if (options?.where?.status) {
    sql += ` AND status = ?`;
    params.push(options.where.status);
  }

  sql += ` ORDER BY published_at DESC`;

  if (options?.limit !== undefined) {
    sql += ` LIMIT ?`;
    params.push(options.limit);
  }

  if (options?.offset !== undefined) {
    sql += ` OFFSET ?`;
    params.push(options.offset);
  }

  const rows = db.prepare(sql).all(...params) as ArticleRow[];
  return rows.map((r) => mapArticleRow(r));
}

export function getCategoryCounts(): (Category & { articleCount: number })[] {
  const db = getDb();
  const cats = findAll<Category>("categories") as Category[];
  return cats.map((cat) => {
    const row = db
      .prepare(
        `SELECT COUNT(*) as count FROM article_categories ac
         JOIN articles a ON a.id = ac.article_id
         WHERE ac.category_id = ? AND a.status = 'published'`
      )
      .get(cat.id) as { count: number };
    return { ...cat, articleCount: row.count };
  });
}

export function getDashboardStats(): {
  totalArticles: number;
  totalPublished: number;
  totalDrafts: number;
  totalViews: number;
  totalCategories: number;
  totalUsers: number;
  totalComments: number;
  pendingComments: number;
  recentArticles: Article[];
} {
  const db = getDb();

  const totalArticles = (
    db.prepare(`SELECT COUNT(*) as c FROM articles`).get() as { c: number }
  ).c;
  const totalPublished = (
    db
      .prepare(`SELECT COUNT(*) as c FROM articles WHERE status = 'published'`)
      .get() as { c: number }
  ).c;
  const totalDrafts = (
    db
      .prepare(`SELECT COUNT(*) as c FROM articles WHERE status = 'draft'`)
      .get() as { c: number }
  ).c;
  const totalViews = (
    db
      .prepare(`SELECT COALESCE(SUM(views), 0) as c FROM articles`)
      .get() as { c: number }
  ).c;
  const totalCategories = (
    db.prepare(`SELECT COUNT(*) as c FROM categories`).get() as { c: number }
  ).c;
  const totalUsers = (
    db.prepare(`SELECT COUNT(*) as c FROM users`).get() as { c: number }
  ).c;
  const totalComments = (
    db.prepare(`SELECT COUNT(*) as c FROM comments`).get() as { c: number }
  ).c;
  const pendingComments = (
    db
      .prepare(
        `SELECT COUNT(*) as c FROM comments WHERE status = 'pending'`
      )
      .get() as { c: number }
  ).c;

  const recentRows = db
    .prepare(
      `SELECT * FROM articles ORDER BY created_at DESC LIMIT 5`
    )
    .all() as ArticleRow[];
  const recentArticles = recentRows.map((r) => mapArticleRow(r));

  return {
    totalArticles,
    totalPublished,
    totalDrafts,
    totalViews,
    totalCategories,
    totalUsers,
    totalComments,
    pendingComments,
    recentArticles,
  };
}

export function getArticleCount(): number {
  const db = getDb();
  return (
    db.prepare(`SELECT COUNT(*) as c FROM articles`).get() as { c: number }
  ).c;
}

export function getArticleCountByStatus(status: string): number {
  const db = getDb();
  return (
    db
      .prepare(`SELECT COUNT(*) as c FROM articles WHERE status = ?`)
      .get(status) as { c: number }
  ).c;
}

export function incrementArticleViews(id: string): void {
  const db = getDb();
  db.prepare(`UPDATE articles SET views = views + 1 WHERE id = ?`).run(id);
}

export function getArticleBySlug(slug: string): Article | undefined {
  return findBy<Article>("articles", "slug", slug);
}

export function getTags(options?: QueryOptions): TagRow[] {
  const db = getDb();
  const { clause, params } = buildWhereClause(options?.where ?? {});
  let sql = `SELECT * FROM tags ${clause}`;
  if (options?.orderBy) sql += ` ORDER BY ${safeOrderBy(options.orderBy)}`;
  if (options?.limit !== undefined) {
    sql += ` LIMIT ?`;
    params.push(options.limit);
  }
  if (options?.offset !== undefined) {
    sql += ` OFFSET ?`;
    params.push(options.offset);
  }
  return db.prepare(sql).all(...params) as TagRow[];
}

export function getTagById(id: string): TagRow | undefined {
  const db = getDb();
  return db
    .prepare(`SELECT * FROM tags WHERE id = ?`)
    .get(id) as TagRow | undefined;
}

export function getTagBySlug(slug: string): TagRow | undefined {
  const db = getDb();
  return db
    .prepare(`SELECT * FROM tags WHERE slug = ?`)
    .get(slug) as TagRow | undefined;
}

export function createTag(data: {
  id?: string;
  slug: string;
  name: { fr: string; ar: string };
}): TagRow {
  const db = getDb();
  const id = data.id ?? uuidv4();
  db.prepare(
    `INSERT INTO tags (id, slug, name_fr, name_ar) VALUES (?, ?, ?, ?)`
  ).run(id, data.slug, data.name.fr, data.name.ar);
  return db
    .prepare(`SELECT * FROM tags WHERE id = ?`)
    .get(id) as TagRow;
}

export function updateTag(
  id: string,
  data: { slug?: string; name?: { fr: string; ar: string } }
): TagRow | undefined {
  const db = getDb();
  const existing = db
    .prepare(`SELECT * FROM tags WHERE id = ?`)
    .get(id) as TagRow | undefined;
  if (!existing) return undefined;

  if (data.slug !== undefined) {
    db.prepare(`UPDATE tags SET slug = ? WHERE id = ?`).run(data.slug, id);
  }
  if (data.name !== undefined) {
    db.prepare(`UPDATE tags SET name_fr = ?, name_ar = ? WHERE id = ?`).run(
      data.name.fr,
      data.name.ar,
      id
    );
  }
  return db
    .prepare(`SELECT * FROM tags WHERE id = ?`)
    .get(id) as TagRow;
}

export function deleteTag(id: string): boolean {
  const db = getDb();
  const result = db.prepare(`DELETE FROM tags WHERE id = ?`).run(id);
  return result.changes > 0;
}

export function getComments(
  articleId?: string,
  status?: string
): CommentRow[] {
  const db = getDb();
  let sql = `SELECT * FROM comments`;
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (articleId) {
    conditions.push(`article_id = ?`);
    params.push(articleId);
  }
  if (status) {
    conditions.push(`status = ?`);
    params.push(status);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }
  sql += ` ORDER BY created_at DESC`;

  return db.prepare(sql).all(...params) as CommentRow[];
}

export function getCommentById(id: string): CommentRow | undefined {
  const db = getDb();
  return db
    .prepare(`SELECT * FROM comments WHERE id = ?`)
    .get(id) as CommentRow | undefined;
}

export function createComment(data: {
  article_id: string;
  author_name: string;
  author_email: string;
  content: string;
}): CommentRow {
  const db = getDb();
  const id = uuidv4();
  db.prepare(
    `INSERT INTO comments (id, article_id, author_name, author_email, content, status)
     VALUES (?, ?, ?, ?, ?, 'pending')`
  ).run(id, data.article_id, data.author_name, data.author_email, data.content);
  return db
    .prepare(`SELECT * FROM comments WHERE id = ?`)
    .get(id) as CommentRow;
}

export function updateCommentStatus(
  id: string,
  status: string
): CommentRow | undefined {
  const db = getDb();
  const existing = getCommentById(id);
  if (!existing) return undefined;
  db.prepare(`UPDATE comments SET status = ? WHERE id = ?`).run(status, id);
  return getCommentById(id);
}

export function deleteComment(id: string): boolean {
  const db = getDb();
  const result = db.prepare(`DELETE FROM comments WHERE id = ?`).run(id);
  return result.changes > 0;
}

export function getNewsletterByEmail(email: string): NewsletterRow | undefined {
  const db = getDb();
  return db
    .prepare(`SELECT * FROM newsletters WHERE email = ?`)
    .get(email) as NewsletterRow | undefined;
}

export function subscribeNewsletter(email: string): NewsletterRow {
  const db = getDb();
  const existing = getNewsletterByEmail(email);
  if (existing) {
    if (existing.subscribed === 0) {
      db.prepare(`UPDATE newsletters SET subscribed = 1 WHERE id = ?`).run(
        existing.id
      );
      return { ...existing, subscribed: 1 };
    }
    return existing;
  }
  const id = uuidv4();
  db.prepare(
    `INSERT INTO newsletters (id, email, subscribed) VALUES (?, ?, 1)`
  ).run(id, email);
  return db
    .prepare(`SELECT * FROM newsletters WHERE id = ?`)
    .get(id) as NewsletterRow;
}

export function unsubscribeNewsletter(email: string): boolean {
  const db = getDb();
  const result = db
    .prepare(`UPDATE newsletters SET subscribed = 0 WHERE email = ?`)
    .run(email);
  return result.changes > 0;
}

export function getArticleTags(articleId: string): TagRow[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT t.* FROM tags t
       JOIN article_tags at ON t.id = at.tag_id
       WHERE at.article_id = ?
       ORDER BY t.name_fr`
    )
    .all(articleId) as TagRow[];
}

export function saveMedia(data: {
  id?: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
  alt_text?: string;
  uploaded_by?: string;
}): MediaRow {
  const db = getDb();
  const id = data.id ?? uuidv4();
  db.prepare(
    `INSERT INTO media (id, filename, original_name, mime_type, size, url, alt_text, uploaded_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    data.filename,
    data.original_name,
    data.mime_type,
    data.size,
    data.url,
    data.alt_text ?? "",
    data.uploaded_by ?? null
  );
  return db
    .prepare(`SELECT * FROM media WHERE id = ?`)
    .get(id) as MediaRow;
}

export function logArticleView(
  articleId: string,
  ipAddress?: string,
  userAgent?: string
): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO views_log (id, article_id, ip_address, user_agent) VALUES (?, ?, ?, ?)`
  ).run(uuidv4(), articleId, ipAddress ?? null, userAgent ?? null);
}

export function getArticleIdsByTagSlug(tagSlug: string): string[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT at.article_id FROM article_tags at
       JOIN tags t ON t.id = at.tag_id
       WHERE t.slug = ?`
    )
    .all(tagSlug) as { article_id: string }[];
  return rows.map((r) => r.article_id);
}

export function getTotalArticleCount(where?: Record<string, unknown>): number {
  const db = getDb();
  const { clause, params } = buildWhereClause(where ?? {});
  const sql = `SELECT COUNT(*) as c FROM articles ${clause}`;
  return (db.prepare(sql).get(...params) as { c: number }).c;
}
