import { redirect } from "next/navigation";
import { getSession, requireAdmin } from "@/lib/auth";
import { findAll } from "@/lib/db";
import type { Article, Category } from "@/lib/types";
import CategoriesList from "@/components/admin/CategoriesList";

export default async function AdminCategoriesPage() {
  const user = await getSession();
  if (!user) redirect("/admin/login");
  if (!requireAdmin(user)) redirect("/admin");

  const categories = findAll<Category>("categories");
  const articles = findAll<Article>("articles");

  categories.sort((a, b) => a.order - b.order);

  const articleCounts: Record<string, number> = {};
  for (const article of articles) {
    for (const catId of article.categoryIds) {
      articleCounts[catId] = (articleCounts[catId] || 0) + 1;
    }
  }

  return (
    <CategoriesList categories={categories} articleCounts={articleCounts} />
  );
}
