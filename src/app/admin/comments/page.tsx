import { redirect } from "next/navigation";
import { getSession, requireAdmin } from "@/lib/auth";
import { findAll } from "@/lib/db";
import type { Article, Comment } from "@/lib/types";
import CommentsList from "@/components/admin/CommentsList";

export default async function CommentsPage() {
  const user = await getSession();
  if (!user) redirect("/admin/login");
  if (!requireAdmin(user)) redirect("/admin");

  const comments = findAll<Comment>("comments");
  const articles = findAll<Article>("articles");

  const enriched = comments
    .map((c) => {
      const article = articles.find((a) => a.id === c.articleId);
      return {
        ...c,
        articleTitle: article ? article.title.fr : c.articleId,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Commentaires</h1>
      <CommentsList comments={enriched} />
    </div>
  );
}
