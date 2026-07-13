import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { findAll } from "@/lib/db";
import type { Article } from "@/lib/types";
import ArticlesList from "@/components/admin/ArticlesList";

const PAGE_SIZE = 10;

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function AdminArticlesPage({ searchParams }: PageProps) {
  const user = await getSession();
  if (!user) redirect("/admin/login");

  const { page, status } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);

  let articles = findAll<Article>("articles");

  if (status === "published" || status === "draft") {
    articles = articles.filter((a) => a.status === status);
  }

  articles.sort((a, b) => {
    const da = a.publishedAt || a.createdAt;
    const db = b.publishedAt || b.createdAt;
    return db.localeCompare(da);
  });

  const totalPages = Math.ceil(articles.length / PAGE_SIZE);
  const paged = articles.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <ArticlesList
      articles={paged}
      currentPage={currentPage}
      totalPages={totalPages}
    />
  );
}
