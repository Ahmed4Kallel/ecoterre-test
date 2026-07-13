"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
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
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Articles</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            {articles.length} article{articles.length > 1 ? "s" : ""} sur cette page
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-green-700 hover:to-emerald-800 hover:shadow-md"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvel article
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {[
          { label: "Tous", value: "", color: "bg-gray-500" },
          { label: "Publiés", value: "published", color: "bg-green-500" },
          { label: "Brouillons", value: "draft", color: "bg-amber-500" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilter(f.value)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all cursor-pointer ${
              currentFilter === f.value
                ? "bg-green-800 text-white shadow-sm dark:bg-green-700"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:border-slate-700"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${f.color}`} />
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 dark:border-slate-700 dark:bg-slate-800/50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Titre
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 hidden md:table-cell">
                  Statut
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 hidden md:table-cell">
                  Auteur
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 hidden lg:table-cell">
                  Date
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {articles.map((article, idx) => (
                <motion.tr
                  key={article.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.03 * idx }}
                  className="group hover:bg-gray-50/80 dark:hover:bg-slate-800/50"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {article.coverImage && (
                        <img
                          src={article.coverImage}
                          alt=""
                          className="h-10 w-10 flex-shrink-0 rounded-lg object-cover ring-1 ring-gray-200 dark:ring-slate-700"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900 dark:text-slate-100 max-w-[280px]">
                          {article.title.fr}
                        </p>

                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <StatusBadge status={article.status} />
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 hidden md:table-cell dark:text-slate-400">
                    {article.authorName}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500 hidden lg:table-cell dark:text-slate-400">
                    <span className="whitespace-nowrap">
                      {formatDate(article.publishedAt || article.createdAt)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Modifier
                      </Link>
                      <button
                        onClick={() => handleDelete(article.id)}
                        disabled={deletingId === article.id}
                        className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/30 cursor-pointer"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {deletingId === article.id ? "..." : "Supprimer"}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {articles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-500 dark:text-slate-400">
                    <svg className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
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

function StatusBadge({ status }: { status: string }) {
  const isPublished = status === "published";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        isPublished
          ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
          : "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isPublished ? "bg-green-500" : "bg-gray-400 dark:bg-slate-500"
        }`}
      />
      {isPublished ? "Publié" : "Brouillon"}
    </span>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
