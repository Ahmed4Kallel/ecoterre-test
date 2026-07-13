import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { findAll } from "@/lib/db";
import type { Article } from "@/lib/types";
import AdminProfileClient from "./AdminProfileClient";

export default async function AdminProfilePage() {
  const user = await getSession();
  if (!user) redirect("/admin/login");

  const articles = findAll<Article>("articles");
  const userArticles = articles.filter((a) => a.authorId === user.id);
  const publishedCount = userArticles.filter((a) => a.status === "published").length;

  return (
    <AdminProfileClient
      user={{
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      }}
      stats={{
        articleCount: userArticles.length,
        publishedCount,
      }}
    />
  );
}
