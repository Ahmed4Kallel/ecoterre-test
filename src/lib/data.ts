import "server-only";
import {
  findAll,
  findById,
  findBy,
  searchArticles as dbSearch,
  getCategoryCounts,
  getDashboardStats,
  getTags as dbGetTags,
  enrichArticleWithRelations,
} from "./db";
import { supabase } from "./database";
import type { ArticleRow } from "./db-types";
import type { Article, Category, Tag } from "./types";

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
  let query = supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (options?.featured) {
    query = query.eq("is_featured", 1);
  }

  if (options?.category) {
    const { data: catIds } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", options.category)
      .single();
    if (catIds) {
      const { data: artIds } = await supabase
        .from("article_categories")
        .select("article_id")
        .eq("category_id", catIds.id);
      const ids = (artIds ?? []).map((r: { article_id: string }) => r.article_id);
      if (ids.length > 0) query = query.in("id", ids);
      else return [];
    }
  }

  if (options?.tag) {
    const { data: tag } = await supabase
      .from("tags")
      .select("id")
      .eq("slug", options.tag)
      .maybeSingle();
    if (tag) {
      const { data: artIds } = await supabase
        .from("article_tags")
        .select("article_id")
        .eq("tag_id", tag.id);
      const ids = (artIds ?? []).map((r: { article_id: string }) => r.article_id);
      if (ids.length > 0) query = query.in("id", ids);
      else return [];
    }
  }

  if (options?.limit !== undefined) {
    const start = options?.offset ?? 0;
    query = query.range(start, start + options.limit - 1);
  }

  const { data, error } = await query;
  if (error) throw error;
  if (!data) return [];

  const articles = await Promise.all(
    (data as ArticleRow[]).map((r) => {
      const a = {
        id: r.id,
        slug: r.slug,
        title: { fr: r.title_fr, ar: r.title_ar },
        content: { fr: r.content_fr, ar: r.content_ar },
        excerpt: { fr: r.excerpt_fr ?? "", ar: r.excerpt_ar ?? "" },
        coverImage: r.cover_image ?? undefined,
        categoryIds: [],
        tagIds: undefined,
        authorId: r.author_id,
        authorName: undefined,
        status: r.status,
        views: r.views ?? 0,
        readingTime: r.reading_time ?? 0,
        isFeatured: r.is_featured === 1,
        audioUrl: r.audio_url ?? undefined,
        videoUrl: r.video_url ?? undefined,
        pdfUrl: r.pdf_url ?? undefined,
        publishedAt: r.published_at ?? undefined,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
      return enrichArticleWithRelations(a);
    })
  );
  return articles;
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  return findBy<Article>("articles", "slug", slug);
}

export async function getArticleById(id: string): Promise<Article | undefined> {
  return findById<Article>("articles", id);
}

export async function getCategories(): Promise<Category[]> {
  return findAll<Category>("categories", { orderBy: "sort_order ASC" });
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  return findBy<Category>("categories", "slug", slug);
}

export async function getTags(): Promise<Tag[]> {
  const rows = await dbGetTags({ orderBy: "name_fr ASC" });
  return rows.map(mapTagRow);
}

export async function getRelatedArticles(
  articleId: string,
  categoryIds: string[],
  limit = 3
): Promise<Article[]> {
  if (categoryIds.length === 0) return [];

  const { data: artIds } = await supabase
    .from("article_categories")
    .select("article_id")
    .in("category_id", categoryIds)
    .neq("article_id", articleId);

  if (!artIds || artIds.length === 0) return [];

  const uniqueIds = [...new Set((artIds as { article_id: string }[]).map((r) => r.article_id))];
  const takenIds = uniqueIds.slice(0, limit);

  const { data: rows } = await supabase
    .from("articles")
    .select("*")
    .in("id", takenIds)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (!rows) return [];

  const articles = await Promise.all(
    (rows as ArticleRow[]).map((r) => {
      const a = {
        id: r.id,
        slug: r.slug,
        title: { fr: r.title_fr, ar: r.title_ar },
        content: { fr: r.content_fr, ar: r.content_ar },
        excerpt: { fr: r.excerpt_fr ?? "", ar: r.excerpt_ar ?? "" },
        coverImage: r.cover_image ?? undefined,
        categoryIds: [],
        tagIds: undefined,
        authorId: r.author_id,
        authorName: undefined,
        status: r.status,
        views: r.views ?? 0,
        readingTime: r.reading_time ?? 0,
        isFeatured: r.is_featured === 1,
        audioUrl: r.audio_url ?? undefined,
        videoUrl: r.video_url ?? undefined,
        pdfUrl: r.pdf_url ?? undefined,
        publishedAt: r.published_at ?? undefined,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
      return enrichArticleWithRelations(a);
    })
  );
  return articles;
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
