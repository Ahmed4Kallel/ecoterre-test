import { NextResponse } from "next/server";
import { getSession, requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/database";
import { findAll } from "@/lib/db";
import type { Article, Category, User } from "@/lib/types";

export async function GET() {
  try {
    const user = await getSession();
    if (!requireAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const articles = findAll<Article>("articles");
    const categories = findAll<Category>("categories");
    const users = findAll<User>("users");

    const comments = db.prepare(`SELECT status FROM comments`).all() as { status: string }[];
    const contacts = db.prepare(`SELECT is_read FROM contacts`).all() as { is_read: number }[];
    const newsletters = db.prepare(`SELECT subscribed FROM newsletters`).all() as { subscribed: number }[];

    const totalArticles = articles.length;
    const publishedArticles = articles.filter((a) => a.status === "published").length;
    const draftArticles = articles.filter((a) => a.status === "draft").length;
    const totalCategories = categories.length;
    const totalUsers = users.length;
    const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
    const commentsPending = comments.filter((c) => c.status === "pending").length;
    const subscribersCount = newsletters.filter((s) => s.subscribed === 1).length;

    const topArticles = [...articles]
      .filter((a) => a.status === "published")
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);

    const articlesByCategory = categories.map((cat) => ({
      categoryName: cat.name.fr,
      count: articles.filter((a) => a.categoryIds.includes(cat.id)).length,
    }));

    const contactMessagesUnread = contacts.filter((c) => c.is_read === 0).length;

    return NextResponse.json({
      totalArticles,
      publishedArticles,
      draftArticles,
      totalCategories,
      totalUsers,
      totalViews,
      commentsPending,
      subscribersCount,
      contactMessagesUnread,
      topArticles,
      articlesByCategory,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
