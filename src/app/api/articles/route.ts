import { NextRequest, NextResponse } from "next/server";
import { findAll, insert, getArticleIdsByTagSlug } from "@/lib/db";
import { generateId, slugify } from "@/lib/utils";
import { getSession, requireAuthor } from "@/lib/auth";
import type { Article } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const author = searchParams.get("author");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "published_at";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (author) where.author_id = author;

    let articles = findAll<Article>("articles", {
      where,
      orderBy:
        sort === "published_at"
          ? "published_at DESC"
          : sort === "views"
            ? "views DESC"
            : sort === "created_at"
              ? "created_at DESC"
              : "published_at DESC",
    });

    if (category) {
      articles = articles.filter((a) => a.categoryIds.includes(category));
    }

    if (tag) {
      const tagArticleIds = getArticleIdsByTagSlug(tag);
      articles = articles.filter((a) => tagArticleIds.includes(a.id));
    }

    if (search) {
      const q = search.toLowerCase();
      articles = articles.filter(
        (a) =>
          a.title.fr?.toLowerCase().includes(q) ||
          a.title.ar?.includes(q) ||
          a.excerpt.fr?.toLowerCase().includes(q) ||
          a.excerpt.ar?.includes(q) ||
          a.content.fr?.toLowerCase().includes(q) ||
          a.content.ar?.includes(q)
      );
    }

    const total = articles.length;
    const paginatedArticles = articles.slice(offset, offset + limit);

    return NextResponse.json({
      articles: paginatedArticles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!requireAuthor(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const now = new Date().toISOString();
    const id = generateId();
    const titleFr = body.title?.fr || "";
    const status = body.status || "draft";

    const article = {
      id,
      slug: body.slug || slugify(titleFr || "article"),
      title: body.title,
      content: body.content,
      excerpt: body.excerpt,
      coverImage: body.coverImage || undefined,
      videoUrl: body.videoUrl || undefined,
      categoryIds: body.categoryIds || [],
      tagIds: body.tagIds || [],
      authorId: user!.id,
      status,
      readingTime: body.readingTime || 0,
      isFeatured: body.isFeatured || 0,
      publishedAt: status === "published" ? now : undefined,
      createdAt: now,
      updatedAt: now,
    };

    insert("articles", article);
    return NextResponse.json({ article }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}
