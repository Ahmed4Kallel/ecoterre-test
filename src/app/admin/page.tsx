import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDashboardStats, getCategories } from "@/lib/data";
import type { Article, Category } from "@/lib/types";
import Dashboard from "@/components/admin/Dashboard";

export default async function AdminDashboardPage() {
  const user = await getSession();
  if (!user) redirect("/admin/login");

  const dbStats = await getDashboardStats();
  const categories: Category[] = await getCategories();

  const stats = {
    totalArticles: dbStats.totalArticles,
    publishedArticles: dbStats.totalPublished,
    draftArticles: dbStats.totalDrafts,
    totalCategories: dbStats.totalCategories,
    totalUsers: dbStats.totalUsers,
    totalViews: dbStats.totalViews,
    commentsPending: dbStats.pendingComments,
    contactMessagesUnread: 0,
    recentArticles: dbStats.recentArticles,
    articlesByCategory: [] as { categoryName: string; count: number }[],
  };

  return <Dashboard stats={stats} recentArticles={dbStats.recentArticles} categories={categories} />;
}
