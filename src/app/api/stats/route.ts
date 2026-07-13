import { NextResponse } from "next/server";
import { getSession, requireAdmin } from "@/lib/auth";
import { findAll } from "@/lib/db";
import { supabase } from "@/lib/database";

export async function GET() {
  try {
    const user = await getSession();
    if (!requireAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [articles, categories, users, commentsData, contactsData, newslettersData] = await Promise.all([
      findAll("articles") as Promise<any[]>,
      findAll("categories") as Promise<any[]>,
      findAll("users") as Promise<any[]>,
      supabase.from("comments").select("status"),
      supabase.from("contacts").select("is_read"),
      supabase.from("newsletters").select("subscribed"),
    ]);

    const totalArticles = articles.length;
    const publishedArticles = articles.filter((a: any) => a.status === "published").length;
    const draftArticles = articles.filter((a: any) => a.status === "draft").length;
    const totalCategories = categories.length;
    const totalUsers = users.length;
    const totalViews = articles.reduce((sum: number, a: any) => sum + (a.views || 0), 0);
    const commentsPending = (commentsData.data ?? []).filter((c: any) => c.status === "pending").length;
    const subscribersCount = (newslettersData.data ?? []).filter((s: any) => s.subscribed === 1).length;

    const topArticles = [...articles]
      .filter((a: any) => a.status === "published")
      .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);

    const articlesByCategory = categories.map((cat: any) => ({
      categoryName: cat.name.fr,
      count: articles.filter((a: any) => a.categoryIds.includes(cat.id)).length,
    }));

    const contactMessagesUnread = (contactsData.data ?? []).filter((c: any) => c.is_read === 0).length;

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
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
