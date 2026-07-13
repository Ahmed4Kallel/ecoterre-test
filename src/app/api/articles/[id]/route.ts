import { NextRequest, NextResponse } from "next/server";
import { findById, update, remove, incrementArticleViews, getArticleTags, logArticleView } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { getSession, requireAuthor } from "@/lib/auth";
import type { Article } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const article = await findById<Article>("articles", id);
    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    await incrementArticleViews(id);

    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      undefined;
    const userAgent = request.headers.get("user-agent") || undefined;
    await logArticleView(id, ipAddress, userAgent);

    const tags = await getArticleTags(id);

    return NextResponse.json({
      article,
      tags,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession();
    if (!requireAuthor(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const article = await findById<Article>("articles", id);
    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    if (user!.role !== "admin" && article.authorId !== user!.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const now = new Date().toISOString();

    let publishedAt = article.publishedAt;
    if (body.publishedAt !== undefined) {
      publishedAt = body.publishedAt;
    } else if (
      body.status === "published" &&
      article.status !== "published"
    ) {
      publishedAt = now;
    }

    const titleFr = body.title?.fr || article.title.fr;
    const updates: Record<string, unknown> = {
      slug: body.slug || (body.title?.fr ? slugify(titleFr) : article.slug),
      updatedAt: now,
      publishedAt,
    };

    if (body.title) updates.title = body.title;
    if (body.content) updates.content = body.content;
    if (body.excerpt) updates.excerpt = body.excerpt;
    if (body.coverImage !== undefined) updates.coverImage = body.coverImage;
    if (body.videoUrl !== undefined) updates.videoUrl = body.videoUrl;
    if (body.categoryIds !== undefined) updates.categoryIds = body.categoryIds;
    if (body.tagIds !== undefined) updates.tagIds = body.tagIds;
    if (body.status) updates.status = body.status;
    if (body.readingTime !== undefined) updates.readingTime = body.readingTime;
    if (body.isFeatured !== undefined) updates.isFeatured = body.isFeatured;

    const updated = await update("articles", id, updates);
    return NextResponse.json({ article: updated });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to update article" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession();
    if (!requireAuthor(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const article = await findById<Article>("articles", id);
    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    if (user!.role !== "admin" && article.authorId !== user!.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await remove("articles", id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 }
    );
  }
}
