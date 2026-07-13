import "server-only";
import {
  findAll,
  findById,
  findBy,
  searchArticles as dbSearch,
  getCategoryCounts,
  getDashboardStats,
  getTags as dbGetTags,
} from "./db";
import { getDb } from "./database";
import type { ArticleRow } from "./db-types";
import type { Article, Category, Tag } from "./types";

function makeArticle(row: ArticleRow, db: ReturnType<typeof getDb>): Article {
  const catRows = db
    .prepare(`SELECT category_id FROM article_categories WHERE article_id = ?`)
    .all(row.id) as { category_id: string }[];
  const categoryIds = catRows.map((c) => c.category_id);

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
    authorId: row.author_id,
    authorName: authorRow?.name,
    status: row.status as "draft" | "published",
    publishedAt: row.published_at ?? undefined,
    scheduledAt: row.scheduled_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    audioUrl: row.audio_url ?? undefined,
    pdfUrl: row.pdf_url ?? undefined,
    readingTime: row.reading_time ?? 0,
    isFeatured: row.is_featured === 1,
    views: row.views ?? 0,
    downloadCount: 0,
  };
}

function mapTagRow(row: {
  id: string;
  slug: string;
  name_fr: string;
  name_ar: string;
  created_at: string;
}): Tag {
  return {
    id: row.id,
    slug: row.slug,
    name: { fr: row.name_fr, ar: row.name_ar },
    createdAt: row.created_at,
  };
}

export async function getPublishedArticles(options?: {
  limit?: number;
  offset?: number;
  category?: string;
  tag?: string;
  featured?: boolean;
}): Promise<Article[]> {
  const db = getDb();
  let sql = `SELECT * FROM articles WHERE status = 'published'`;
  const params: unknown[] = [];

  if (options?.featured) {
    sql += ` AND is_featured = 1`;
  }

  if (options?.category) {
    sql += ` AND id IN (SELECT ac.article_id FROM article_categories ac JOIN categories c ON c.id = ac.category_id WHERE c.slug = ?)`;
    params.push(options.category);
  }

  if (options?.tag) {
    sql += ` AND id IN (SELECT at.article_id FROM article_tags at JOIN tags t ON t.id = at.tag_id WHERE t.slug = ?)`;
    params.push(options.tag);
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
  return rows.map((r) => makeArticle(r, db));
}

export async function getArticleBySlug(
  slug: string
): Promise<Article | undefined> {
  return findBy<Article>("articles", "slug", slug);
}

export async function getArticleById(
  id: string
): Promise<Article | undefined> {
  return findById<Article>("articles", id);
}

export async function getCategories(): Promise<Category[]> {
  return findAll<Category>("categories", { orderBy: "sort_order ASC" });
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | undefined> {
  return findBy<Category>("categories", "slug", slug);
}

export async function getTags(): Promise<Tag[]> {
  const rows = dbGetTags({ orderBy: "name_fr ASC" });
  return rows.map(mapTagRow);
}

export async function getRelatedArticles(
  articleId: string,
  categoryIds: string[],
  limit = 3
): Promise<Article[]> {
  if (categoryIds.length === 0) return [];

  const db = getDb();
  const placeholders = categoryIds.map(() => "?").join(", ");
  const sql = `
    SELECT DISTINCT a.* FROM articles a
    JOIN article_categories ac ON a.id = ac.article_id
    WHERE ac.category_id IN (${placeholders})
      AND a.id != ?
      AND a.status = 'published'
    ORDER BY a.published_at DESC
    LIMIT ?
  `;

  const params: unknown[] = [...categoryIds, articleId, limit];
  const rows = db.prepare(sql).all(...params) as ArticleRow[];
  return rows.map((r) => makeArticle(r, db));
}

export async function searchArticles(
  query: string,
  locale: string,
  options?: { limit?: number }
): Promise<Article[]> {
  return dbSearch(query, locale, {
    where: { status: "published" },
    limit: options?.limit,
  });
}

export { getCategoryCounts, getDashboardStats };
