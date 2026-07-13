import { redirect } from "next/navigation";
import { getSession, requireAuthor } from "@/lib/auth";
import { findAll } from "@/lib/db";
import type { Category } from "@/lib/types";
import ArticleEditor from "@/components/admin/ArticleEditor";

export default async function NewArticlePage() {
  const user = await getSession();
  if (!user) redirect("/admin/login");
  if (!requireAuthor(user)) redirect("/admin");

  const categories = await findAll<Category>("categories");

  return <ArticleEditor categories={categories} />;
}
