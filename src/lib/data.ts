import "server-only";
import {
  findAll,
  findById,
  findBy,
  searchArticles as dbSearch,
  getCategoryCounts,
  getDashboardStats,
  getTags as dbGetTags,
  mapArticleRow,
} from "./db";
import { getDb } from "./database";
import type { ArticleRow } from "./db-types";
import type { Article, Category, Tag } from "./types";

function makeArticle(row: ArticleRow, _db: unknown): Article {
  return mapArticleRow(row);
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
