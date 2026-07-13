"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Category } from "@/lib/types";

interface CategoriesListProps {
  categories: Category[];
  articleCounts: Record<string, number>;
}

export default function CategoriesList({
  categories,
  articleCounts,
}: CategoriesListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette catégorie ?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
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

  const maxCount = Math.max(1, ...Object.values(articleCounts));

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Catégories</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            {categories.length} catégorie{categories.length > 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-green-700 hover:to-emerald-800 hover:shadow-md"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nouvelle catégorie
        </Link>
      </div>

      {/* Cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat, idx) => {
          const count = articleCounts[cat.id] || 0;
          const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
          const colors = [
            "from-green-500 to-emerald-600",
            "from-blue-500 to-cyan-600",
            "from-purple-500 to-violet-600",
            "from-amber-500 to-orange-600",
            "from-rose-500 to-pink-600",
            "from-teal-500 to-green-600",
            "from-indigo-500 to-blue-600",
            "from-red-500 to-rose-600",
          ];
          const gradient = colors[idx % colors.length];
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * idx }}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold text-gray-900 dark:text-slate-100">
                    {cat.name.fr}
                  </h3>
                  <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-slate-400" dir="rtl">
                    {cat.name.ar}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400 dark:text-slate-500">
                    /{cat.slug}
                  </p>
                </div>
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-sm font-bold text-white shadow-sm`}>
                  {count}
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
                  <span>Articles</span>
                  <span>{count}</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-gray-100 dark:bg-slate-700">
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.1 + 0.05 * idx, ease: "easeOut" }}
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-slate-800">
                <span className="text-xs text-gray-400 dark:text-slate-500">
                  Ordre: {cat.order}
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/categories/${cat.id}/edit`}
                    className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30"
                  >
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    disabled={deletingId === cat.id}
                    className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/30 cursor-pointer"
                  >
                    {deletingId === cat.id ? "..." : "Supprimer"}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
        {categories.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500 dark:text-slate-400">
            <svg className="mb-3 h-10 w-10 text-gray-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Aucune catégorie trouvée.
          </div>
        )}
      </div>
    </div>
  );
}
