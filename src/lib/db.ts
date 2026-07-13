import "server-only";
import { supabase } from "./database";
import { v4 as uuidv4 } from "uuid";
import type { Article, Category, User, ContactMessage } from "./types";
import type {
  ArticleRow, CategoryRow, UserRow, TagRow, CommentRow,
  ContactRow, NewsletterRow, MediaRow, SettingRow,
} from "./db-types";

// ── Helpers ──────────────────────────────────────────────

function rowToArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    slug: row.slug,
    title: { fr: row.title_fr, ar: row.title_ar },
    content: { fr: row.content_fr, ar: row.content_ar },
    excerpt: { fr: row.excerpt_fr ?? "", ar: row.excerpt_ar ?? "" },
    coverImage: row.cover_image ?? undefined,
    categoryIds: [],
    tagIds: undefined,
    authorId: row.author_id,
    authorName: undefined,
    status: row.status,
    views: row.views ?? 0,
    readingTime: row.reading_time ?? 0,
    isFeatured: row.is_featured === 1,
    audioUrl: row.audio_url ?? undefined,
    videoUrl: row.video_url ?? undefined,
    pdfUrl: row.pdf_url ?? undefined,
    publishedAt: row.published_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: { fr: row.name_fr, ar: row.name_ar },
    description: { fr: row.description_fr ?? "", ar: row.description_ar ?? "" },
    icon: row.icon ?? undefined,
    order: row.sort_order,
  };
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    password: row.password,
    name: row.name,
    role: row.role,
    avatar: row.avatar ?? undefined,
    bio: row.bio ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToContact(row: ContactRow): ContactMessage {
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

// ── Core CRUD ───────────────────────────────────────────

export async function enrichArticleWithRelations(article: Article): Promise<Article> {
  const [catsRes, tagsRes, authorRes] = await Promise.all([
    supabase.from("article_categories").select("category_id").eq("article_id", article.id),
    supabase.from("article_tags").select("tag_id").eq("article_id", article.id),
    supabase.from("users").select("name").eq("id", article.authorId).single(),
  ]);
  article.categoryIds = (catsRes.data ?? []).map((c: { category_id: string }) => c.category_id);
  const tagIds = (tagsRes.data ?? []).map((t: { tag_id: string }) => t.tag_id);
  if (tagIds.length > 0) article.tagIds = tagIds;
  article.authorName = authorRes.data?.name ?? undefined;
  return article;
}

export async function findAll<T>(
  table: string,
  options?: {
    where?: Record<string, unknown>;
    orderBy?: string;
    limit?: number;
    offset?: number;
  }
): Promise<T[]> {
  let query = supabase.from(table).select("*");
  if (options?.where) {
    for (const [key, val] of Object.entries(options.where)) {
      if (val !== undefined && val !== null) {
        query = query.eq(key, val) as typeof query;
      }
    }
  }
  if (options?.orderBy) {
    const parts = options.orderBy.split(" ");
    const col = parts[0];
    const dir = parts[1] === "DESC" ? { ascending: false } : { ascending: true };
    query = query.order(col, dir) as typeof query;
  }
  if (options?.limit !== undefined) query = query.range(0, options.limit - 1) as typeof query;
  if (options?.offset !== undefined && options?.limit !== undefined) {
    query = query.range(options.offset, options.offset + options.limit - 1) as typeof query;
  }

  const { data, error } = await query;
  if (error) throw error;
  if (!data) return [];

  if (table === "articles") {
    const articles = await Promise.all(
      (data as ArticleRow[]).map((r) => enrichArticleWithRelations(rowToArticle(r)))
    );
    return articles as unknown as T[];
  }
  if (table === "categories") return (data as CategoryRow[]).map(rowToCategory) as unknown as T[];
  if (table === "users") return (data as UserRow[]).map(rowToUser) as unknown as T[];
  if (table === "contacts") return (data as ContactRow[]).map(rowToContact) as unknown as T[];
  return data as T[];
}

export async function findById<T>(table: string, id: string): Promise<T | undefined> {
  const { data, error } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return undefined;

  if (table === "articles") {
    const article = rowToArticle(data as ArticleRow);
    return (await enrichArticleWithRelations(article)) as unknown as T;
  }
  if (table === "categories") return rowToCategory(data as CategoryRow) as unknown as T;
  if (table === "users") return rowToUser(data as UserRow) as unknown as T;
  return data as T;
}

export async function findBy<T>(table: string, key: string, value: unknown): Promise<T | undefined> {
  const { data, error } = await supabase.from(table).select("*").eq(key, value as string).maybeSingle();
  if (error) throw error;
  if (!data) return undefined;

  if (table === "users") return rowToUser(data as UserRow) as unknown as T;
  if (table === "articles") {
    const article = rowToArticle(data as ArticleRow);
    return (await enrichArticleWithRelations(article)) as unknown as T;
  }
  if (table === "categories") return rowToCategory(data as CategoryRow) as unknown as T;
  return data as T;
}

export async function findAllBy<T>(table: string, filter: Record<string, unknown>): Promise<T[]> {
  return findAll<T>(table, { where: filter });
}

export async function insert(table: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
  if (table === "articles") return insertArticle(data);
  if (table === "categories") return insertCategory(data);
  if (table === "users") return insertUser(data);
  if (table === "contacts") return insertContact(data);

  const { error } = await supabase.from(table).insert(data);
  if (error) throw error;
  return data;
}

async function insertArticle(data: Record<string, unknown>): Promise<Record<string, unknown>> {
  const titleFr = (data.title as Record<string, string>)?.fr ?? "";
  const titleAr = (data.title as Record<string, string>)?.ar ?? "";
  const contentFr = (data.content as Record<string, string>)?.fr ?? "";
  const contentAr = (data.content as Record<string, string>)?.ar ?? "";
  const excerptFr = (data.excerpt as Record<string, string>)?.fr ?? "";
  const excerptAr = (data.excerpt as Record<string, string>)?.ar ?? "";

  const row = {
    id: data.id,
    slug: data.slug,
    title_fr: titleFr,
    title_ar: titleAr,
    content_fr: contentFr,
    content_ar: contentAr,
    excerpt_fr: excerptFr,
    excerpt_ar: excerptAr,
    cover_image: data.coverImage ?? null,
    audio_url: data.audioUrl ?? null,
    video_url: data.videoUrl ?? null,
    pdf_url: data.pdfUrl ?? null,
    author_id: data.authorId,
    status: data.status ?? "draft",
    views: data.views ?? 0,
    reading_time: data.readingTime ?? 0,
    is_featured: data.isFeatured ?? 0,
    published_at: data.publishedAt ?? null,
    scheduled_at: data.scheduledAt ?? null,
    created_at: data.createdAt ?? new Date().toISOString(),
    updated_at: data.updatedAt ?? new Date().toISOString(),
  };

  const { error } = await supabase.from("articles").insert(row);
  if (error) throw error;

  const categoryIds = (data.categoryIds ?? []) as string[];
  if (categoryIds.length > 0) {
    const catRows = categoryIds.map((catId: string) => ({ article_id: data.id as string, category_id: catId }));
    await supabase.from("article_categories").insert(catRows);
  }

  const tagIds = (data.tagIds ?? []) as string[];
  if (tagIds.length > 0) {
    const tagRows = tagIds.map((tagId: string) => ({ article_id: data.id as string, tag_id: tagId }));
    await supabase.from("article_tags").insert(tagRows);
  }

  return data;
}

async function insertCategory(data: Record<string, unknown>): Promise<Record<string, unknown>> {
  const nameFr = (data.name as Record<string, string>)?.fr ?? "";
  const nameAr = (data.name as Record<string, string>)?.ar ?? "";
  const descFr = (data.description as Record<string, string>)?.fr ?? "";
  const descAr = (data.description as Record<string, string>)?.ar ?? "";

  const { error } = await supabase.from("categories").insert({
    id: data.id,
    slug: data.slug,
    name_fr: nameFr,
    name_ar: nameAr,
    description_fr: descFr,
    description_ar: descAr,
    icon: data.icon ?? null,
    sort_order: data.order ?? 0,
    created_at: new Date().toISOString(),
  });
  if (error) throw error;
  return data;
}

async function insertUser(data: Record<string, unknown>): Promise<Record<string, unknown>> {
  const now = (data.createdAt as string) ?? new Date().toISOString();
  const { error } = await supabase.from("users").insert({
    id: data.id,
    email: data.email,
    password: data.password,
    name: data.name,
    role: data.role ?? "author",
    avatar: data.avatar ?? null,
    bio: data.bio ?? null,
    created_at: now,
    updated_at: now,
  });
  if (error) throw error;
  return data;
}

async function insertContact(data: Record<string, unknown>): Promise<Record<string, unknown>> {
  const { error } = await supabase.from("contacts").insert({
    id: data.id,
    name: data.name,
    email: data.email,
    subject: data.subject ?? "",
    message: data.message,
    is_read: data.is_read ?? 0,
    created_at: data.created_at ?? new Date().toISOString(),
  });
  if (error) throw error;
  return data;
}

export async function update(
  table: string,
  id: string,
  data: Record<string, unknown>
): Promise<Record<string, unknown> | undefined> {
  if (table === "articles") return updateArticle(id, data);
  if (table === "categories") return updateCategory(id, data);
  if (table === "users") return updateUser(id, data);

  const { error } = await supabase.from(table).update(data).eq("id", id);
  if (error) throw error;
  const { data: updated } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
  return updated ?? undefined;
}

async function updateArticle(id: string, data: Record<string, unknown>): Promise<Record<string, unknown> | undefined> {
  const existing = await findById<Article>("articles", id);
  if (!existing) return undefined;

  const updates: Record<string, unknown> = {};

  if (data.title !== undefined) {
    const t = data.title as Record<string, string>;
    updates.title_fr = t.fr ?? existing.title.fr;
    updates.title_ar = t.ar ?? existing.title.ar;
  }
  if (data.content !== undefined) {
    const c = data.content as Record<string, string>;
    updates.content_fr = c.fr ?? existing.content.fr;
    updates.content_ar = c.ar ?? existing.content.ar;
  }
  if (data.excerpt !== undefined) {
    const e = data.excerpt as Record<string, string>;
    updates.excerpt_fr = e.fr ?? existing.excerpt.fr;
    updates.excerpt_ar = e.ar ?? existing.excerpt.ar;
  }
  if (data.slug !== undefined) updates.slug = data.slug;
  if (data.coverImage !== undefined) updates.cover_image = data.coverImage;
  if (data.audioUrl !== undefined) updates.audio_url = data.audioUrl;
  if (data.videoUrl !== undefined) updates.video_url = data.videoUrl;
  if (data.pdfUrl !== undefined) updates.pdf_url = data.pdfUrl;
  if (data.status !== undefined) updates.status = data.status;
  if (data.views !== undefined) updates.views = data.views;
  if (data.readingTime !== undefined) updates.reading_time = data.readingTime;
  if (data.isFeatured !== undefined) updates.is_featured = data.isFeatured;
  if (data.publishedAt !== undefined) updates.published_at = data.publishedAt;
  if (data.scheduledAt !== undefined) updates.scheduled_at = data.scheduledAt;
  updates.updated_at = new Date().toISOString();

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.from("articles").update(updates).eq("id", id);
    if (error) throw error;
  }

  if (data.categoryIds !== undefined) {
    await supabase.from("article_categories").delete().eq("article_id", id);
    const categoryIds = data.categoryIds as string[];
    if (categoryIds.length > 0) {
      await supabase.from("article_categories").insert(
        categoryIds.map((catId: string) => ({ article_id: id, category_id: catId }))
      );
    }
  }

  if (data.tagIds !== undefined) {
    await supabase.from("article_tags").delete().eq("article_id", id);
    const tagIds = data.tagIds as string[];
    if (tagIds.length > 0) {
      await supabase.from("article_tags").insert(
        tagIds.map((tagId: string) => ({ article_id: id, tag_id: tagId }))
      );
    }
  }

  return findById("articles", id) as Promise<Record<string, unknown> | undefined>;
}

async function updateCategory(id: string, data: Record<string, unknown>): Promise<Record<string, unknown> | undefined> {
  const existing = await findById<Category>("categories", id);
  if (!existing) return undefined;

  const updates: Record<string, unknown> = {};
  if (data.name !== undefined) {
    const n = data.name as Record<string, string>;
    updates.name_fr = n.fr ?? existing.name.fr;
    updates.name_ar = n.ar ?? existing.name.ar;
  }
  if (data.description !== undefined) {
    const d = data.description as Record<string, string>;
    updates.description_fr = d.fr ?? existing.description.fr;
    updates.description_ar = d.ar ?? existing.description.ar;
  }
  if (data.slug !== undefined) updates.slug = data.slug;
  if (data.icon !== undefined) updates.icon = data.icon;
  if (data.order !== undefined) updates.sort_order = data.order;

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.from("categories").update(updates).eq("id", id);
    if (error) throw error;
  }

  return findById("categories", id) as Promise<Record<string, unknown> | undefined>;
}

async function updateUser(id: string, data: Record<string, unknown>): Promise<Record<string, unknown> | undefined> {
  const updates: Record<string, unknown> = {};
  if (data.email !== undefined) updates.email = data.email;
  if (data.password !== undefined) updates.password = data.password;
  if (data.name !== undefined) updates.name = data.name;
  if (data.role !== undefined) updates.role = data.role;
  if (data.avatar !== undefined) updates.avatar = data.avatar;
  if (data.bio !== undefined) updates.bio = data.bio;
  updates.updated_at = new Date().toISOString();

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.from("users").update(updates).eq("id", id);
    if (error) throw error;
  }

  return findById("users", id) as Promise<Record<string, unknown> | undefined>;
}

export async function remove(table: string, id: string): Promise<boolean> {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
  return true;
}

// ── Article-specific ─────────────────────────────────────

export async function searchArticles(
  query: string,
  locale?: string,
  options?: { where?: Record<string, unknown>; limit?: number; offset?: number }
): Promise<Article[]> {
  const like = `%${query}%`;

  let sup = supabase.from("articles").select("*");

  if (locale === "ar") {
    sup = sup.or(`title_ar.ilike.${like},content_ar.ilike.${like},excerpt_ar.ilike.${like}`);
  } else if (locale === "fr") {
    sup = sup.or(`title_fr.ilike.${like},content_fr.ilike.${like},excerpt_fr.ilike.${like}`);
  } else {
    sup = sup.or(`title_fr.ilike.${like},content_fr.ilike.${like},excerpt_fr.ilike.${like},title_ar.ilike.${like},content_ar.ilike.${like},excerpt_ar.ilike.${like}`);
  }

  if (options?.where?.status) {
    sup = sup.eq("status", options.where.status as string);
  }

  sup = sup.order("published_at", { ascending: false });

  if (options?.limit !== undefined) {
    if (options?.offset !== undefined) {
      sup = sup.range(options.offset, options.offset + options.limit - 1);
    } else {
      sup = sup.range(0, options.limit - 1);
    }
  }

  const { data, error } = await sup;
  if (error) throw error;
  if (!data) return [];

  const articles = await Promise.all(
    (data as ArticleRow[]).map((r) => enrichArticleWithRelations(rowToArticle(r)))
  );
  return articles;
}

export async function getCategoryCounts(): Promise<(Category & { articleCount: number })[]> {
  const cats = await findAll<Category>("categories");
  const result: (Category & { articleCount: number })[] = [];

  for (const cat of cats) {
    const { data } = await supabase
      .from("article_categories")
      .select("article_id")
      .eq("category_id", cat.id);

    const articleIds = (data ?? []).map((r: { article_id: string }) => r.article_id);
    let count = 0;
    if (articleIds.length > 0) {
      const { count: c } = await supabase
        .from("articles")
        .select("id", { count: "exact", head: true })
        .in("id", articleIds)
        .eq("status", "published");
      count = c ?? 0;
    }
    result.push({ ...cat, articleCount: count });
  }

  return result;
}

export async function getDashboardStats(): Promise<{
  totalArticles: number;
  totalPublished: number;
  totalDrafts: number;
  totalViews: number;
  totalCategories: number;
  totalUsers: number;
  totalComments: number;
  pendingComments: number;
  recentArticles: Article[];
}> {
  const { count: totalArticles } = await supabase.from("articles").select("*", { count: "exact", head: true });
  const { count: totalPublished } = await supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "published");
  const { count: totalDrafts } = await supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "draft");
  const { count: totalCategories } = await supabase.from("categories").select("*", { count: "exact", head: true });
  const { count: totalUsers } = await supabase.from("users").select("*", { count: "exact", head: true });
  const { count: totalComments } = await supabase.from("comments").select("*", { count: "exact", head: true });
  const { count: pendingComments } = await supabase.from("comments").select("*", { count: "exact", head: true }).eq("status", "pending");

  // Sum views manually since Supabase doesn't have COALESCE(SUM)
  const { data: viewData } = await supabase.from("articles").select("views");
  let totalViews = 0;
  if (viewData) {
    for (const r of viewData) totalViews += (r as { views: number }).views ?? 0;
  }

  const recentRows = await findAll<Article>("articles", { orderBy: "created_at DESC", limit: 5 });

  return {
    totalArticles: totalArticles ?? 0,
    totalPublished: totalPublished ?? 0,
    totalDrafts: totalDrafts ?? 0,
    totalViews,
    totalCategories: totalCategories ?? 0,
    totalUsers: totalUsers ?? 0,
    totalComments: totalComments ?? 0,
    pendingComments: pendingComments ?? 0,
    recentArticles: recentRows,
  };
}

export async function getArticleCount(): Promise<number> {
  const { count } = await supabase.from("articles").select("*", { count: "exact", head: true });
  return count ?? 0;
}

export async function getArticleCountByStatus(status: string): Promise<number> {
  const { count } = await supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", status);
  return count ?? 0;
}

export async function incrementArticleViews(id: string): Promise<void> {
  await supabase.rpc("increment_article_views", { article_id: id });
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  return findBy<Article>("articles", "slug", slug);
}

// ── Tags ────────────────────────────────────────────────

export async function getTags(options?: { where?: Record<string, unknown>; orderBy?: string; limit?: number; offset?: number }): Promise<TagRow[]> {
  let query = supabase.from("tags").select("*");
  if (options?.where) {
    for (const [key, val] of Object.entries(options.where)) {
      if (val !== undefined && val !== null) query = query.eq(key, val as string) as typeof query;
    }
  }
  if (options?.orderBy) {
    const parts = options.orderBy.split(" ");
    const dir = parts[1] === "DESC" ? { ascending: false } : { ascending: true };
    query = query.order(parts[0], dir) as typeof query;
  }
  if (options?.limit !== undefined) {
    if (options?.offset !== undefined) {
      query = query.range(options.offset, options.offset + options.limit - 1) as typeof query;
    } else {
      query = query.range(0, options.limit - 1) as typeof query;
    }
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as TagRow[];
}

export async function getTagById(id: string): Promise<TagRow | undefined> {
  const { data } = await supabase.from("tags").select("*").eq("id", id).maybeSingle();
  return data ?? undefined;
}

export async function getTagBySlug(slug: string): Promise<TagRow | undefined> {
  const { data } = await supabase.from("tags").select("*").eq("slug", slug).maybeSingle();
  return data ?? undefined;
}

export async function createTag(data: { id?: string; slug: string; name: { fr: string; ar: string } }): Promise<TagRow> {
  const id = data.id ?? uuidv4();
  const { error } = await supabase.from("tags").insert({ id, slug: data.slug, name_fr: data.name.fr, name_ar: data.name.ar });
  if (error) throw error;
  return (await supabase.from("tags").select("*").eq("id", id).single()).data as TagRow;
}

export async function updateTag(id: string, data: { slug?: string; name?: { fr: string; ar: string } }): Promise<TagRow | undefined> {
  const updates: Record<string, unknown> = {};
  if (data.slug !== undefined) updates.slug = data.slug;
  if (data.name !== undefined) {
    updates.name_fr = data.name.fr;
    updates.name_ar = data.name.ar;
  }
  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.from("tags").update(updates).eq("id", id);
    if (error) throw error;
  }
  const { data: tag } = await supabase.from("tags").select("*").eq("id", id).maybeSingle();
  return tag ?? undefined;
}

export async function deleteTag(id: string): Promise<boolean> {
  const { error } = await supabase.from("tags").delete().eq("id", id);
  if (error) throw error;
  return true;
}

// ── Comments ────────────────────────────────────────────

export async function getComments(articleId?: string, status?: string): Promise<CommentRow[]> {
  let query = supabase.from("comments").select("*");
  if (articleId) query = query.eq("article_id", articleId);
  if (status) query = query.eq("status", status);
  query = query.order("created_at", { ascending: false });
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as CommentRow[];
}

export async function getCommentById(id: string): Promise<CommentRow | undefined> {
  const { data } = await supabase.from("comments").select("*").eq("id", id).maybeSingle();
  return data ?? undefined;
}

export async function createComment(data: { article_id: string; author_name: string; author_email: string; content: string }): Promise<CommentRow> {
  const id = uuidv4();
  const { error } = await supabase.from("comments").insert({
    id,
    article_id: data.article_id,
    author_name: data.author_name,
    author_email: data.author_email,
    content: data.content,
    status: "pending",
  });
  if (error) throw error;
  return (await supabase.from("comments").select("*").eq("id", id).single()).data as CommentRow;
}

export async function updateCommentStatus(id: string, status: string): Promise<CommentRow | undefined> {
  const { error } = await supabase.from("comments").update({ status }).eq("id", id);
  if (error) throw error;
  const { data } = await supabase.from("comments").select("*").eq("id", id).maybeSingle();
  return data ?? undefined;
}

export async function deleteComment(id: string): Promise<boolean> {
  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) throw error;
  return true;
}

// ── Newsletter ──────────────────────────────────────────

export async function getNewsletterByEmail(email: string): Promise<NewsletterRow | undefined> {
  const { data } = await supabase.from("newsletters").select("*").eq("email", email).maybeSingle();
  return data ?? undefined;
}

export async function subscribeNewsletter(email: string): Promise<NewsletterRow> {
  const existing = await getNewsletterByEmail(email);
  if (existing) {
    if (existing.subscribed === 0) {
      await supabase.from("newsletters").update({ subscribed: 1 }).eq("id", existing.id);
      return { ...existing, subscribed: 1 };
    }
    return existing;
  }
  const id = uuidv4();
  const { error } = await supabase.from("newsletters").insert({ id, email, subscribed: 1 });
  if (error) throw error;
  return (await supabase.from("newsletters").select("*").eq("id", id).single()).data as NewsletterRow;
}

export async function unsubscribeNewsletter(email: string): Promise<boolean> {
  const { error } = await supabase.from("newsletters").update({ subscribed: 0 }).eq("email", email);
  if (error) throw error;
  return true;
}

// ── Article relations ───────────────────────────────────

export async function getArticleTags(articleId: string): Promise<TagRow[]> {
  const { data, error } = await supabase
    .from("article_tags")
    .select("tag_id")
    .eq("article_id", articleId);
  if (error) throw error;
  if (!data || data.length === 0) return [];

  const tagIds = (data as { tag_id: string }[]).map((r) => r.tag_id);
  const { data: tags } = await supabase.from("tags").select("*").in("id", tagIds).order("name_fr");
  return (tags ?? []) as TagRow[];
}

export async function saveMedia(data: { id?: string; filename: string; original_name: string; mime_type: string; size: number; url: string; alt_text?: string; uploaded_by?: string }): Promise<MediaRow> {
  const id = data.id ?? uuidv4();
  const { error } = await supabase.from("media").insert({
    id,
    filename: data.filename,
    original_name: data.original_name,
    mime_type: data.mime_type,
    size: data.size,
    url: data.url,
    alt_text: data.alt_text ?? "",
    uploaded_by: data.uploaded_by ?? null,
  });
  if (error) throw error;
  return (await supabase.from("media").select("*").eq("id", id).single()).data as MediaRow;
}

export async function logArticleView(articleId: string, ipAddress?: string, userAgent?: string): Promise<void> {
  await supabase.from("views_log").insert({
    id: uuidv4(),
    article_id: articleId,
    ip_address: ipAddress ?? null,
    user_agent: userAgent ?? null,
  });
}

export async function getArticleIdsByTagSlug(tagSlug: string): Promise<string[]> {
  const { data: tag } = await supabase.from("tags").select("id").eq("slug", tagSlug).maybeSingle();
  if (!tag) return [];
  const { data } = await supabase.from("article_tags").select("article_id").eq("tag_id", tag.id);
  return (data ?? []).map((r: { article_id: string }) => r.article_id);
}

export async function getTotalArticleCount(where?: Record<string, unknown>): Promise<number> {
  let query = supabase.from("articles").select("*", { count: "exact", head: true });
  if (where) {
    for (const [key, val] of Object.entries(where)) {
      if (val !== undefined && val !== null) query = query.eq(key, val as string) as typeof query;
    }
  }
  const { count } = await query;
  return count ?? 0;
}

// Legacy sync wrappers (for backward compat while migrating)
export const mapArticleRow = (row: ArticleRow) => rowToArticle(row);
export const makeArticle = (row: ArticleRow) => rowToArticle(row);
