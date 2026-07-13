import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { getSession, requireAuthor } from "@/lib/auth";
import { findById, findAll } from "@/lib/db";
import type { Article, Category } from "@/lib/types";
import ArticleEditor from "@/components/admin/ArticleEditor";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: PageProps) {
  const user = await getSession();
  if (!user) redirect("/admin/login");
  if (!requireAuthor(user)) redirect("/admin");

  const { id } = await params;
  const article = await findById<Article>("articles", id);

  if (!article) notFound();

  if (user!.role !== "admin" && article.authorId !== user!.id) {
    redirect("/admin/articles");
  }

  const categories = await findAll<Category>("categories");

  return <ArticleEditor article={article} categories={categories} />;
}
