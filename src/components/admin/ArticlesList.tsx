"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import type { Article } from "@/lib/types";

interface ArticlesListProps {
  articles: Article[];
  currentPage: number;
  totalPages: number;
}

export default function ArticlesList({
  articles,
  currentPage,
  totalPages,
}: ArticlesListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const currentFilter = searchParams.get("status") || "";

  function handleFilter(filter: string) {
    const params = new URLSearchParams(searchParams);
    if (filter) {
      params.set("status", filter);
    } else {
      params.delete("status");
    }
    params.delete("page");
    router.push(`/admin/articles?${params.toString()}`);
  }

  async function handleDelete(id: string) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la suppression");
      }
    } catch {
      alert("Erreur réseau");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Articles</h1>
        <Button href="/admin/articles/new" size="sm">
          + Nouvel article
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { label: "Tous", value: "" },
          { label: "Publiés", value: "published" },
          { label: "Brouillons", value: "draft" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilter(f.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              currentFilter === f.value
                ? "bg-green-800 text-white dark:bg-green-700"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:border-slate-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600 dark:bg-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Titre (FR)</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">
                Statut
              </th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">
                Auteur
              </th>
              <th className="px-4 py-3 font-medium hidden lg:table-cell">
                Date
              </th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {articles.map((article) => (
              <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-100">
                  <div className="max-w-xs truncate">{article.title.fr}</div>
                  {article.coverImage && (
                    <span className="text-xs text-gray-400 dark:text-slate-500">Image</span>
                  )}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      article.status === "published"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                        : "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {article.status === "published" ? "Publié" : "Brouillon"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell dark:text-slate-400">
                  {article.authorName}
                </td>
                <td className="px-4 py-3 text-gray-500 hidden lg:table-cell dark:text-slate-400">
                  {new Date(article.publishedAt || article.createdAt).toLocaleDateString(
                    "fr-FR",
                    { day: "numeric", month: "short", year: "numeric" }
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/articles/${article.id}/edit`}
                      className="text-sm text-green-700 hover:underline dark:text-green-400 dark:hover:text-green-300"
                    >
                      Modifier
                    </Link>
                    <button
                      onClick={() => handleDelete(article.id)}
                      disabled={deletingId === article.id}
                      className="text-sm text-red-600 hover:underline disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300 cursor-pointer"
                    >
                      {deletingId === article.id ? "..." : "Supprimer"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-gray-500 dark:text-slate-400"
                >
                  Aucun article trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          baseUrl="/admin/articles"
        />
      )}
    </div>
  );
}
