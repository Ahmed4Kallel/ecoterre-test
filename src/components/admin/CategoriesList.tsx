"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Catégories</h1>
        <Button href="/admin/categories/new" size="sm">
          + Nouvelle catégorie
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600 dark:bg-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">
                Slug
              </th>
              <th className="px-4 py-3 font-medium hidden lg:table-cell">
                Articles
              </th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">
                Ordre
              </th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900 dark:text-slate-100">{cat.name.fr}</div>
                  <div className="text-xs text-gray-400 dark:text-slate-500" dir="rtl">
                    {cat.name.ar}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell dark:text-slate-400">
                  {cat.slug}
                </td>
                <td className="px-4 py-3 text-gray-600 hidden lg:table-cell dark:text-slate-400">
                  {articleCounts[cat.id] || 0}
                </td>
                <td className="px-4 py-3 text-gray-600 hidden sm:table-cell dark:text-slate-400">
                  {cat.order}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/categories/${cat.id}/edit`}
                      className="text-sm text-green-700 hover:underline dark:text-green-400 dark:hover:text-green-300"
                    >
                      Modifier
                    </Link>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      disabled={deletingId === cat.id}
                      className="text-sm text-red-600 hover:underline disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300 cursor-pointer"
                    >
                      {deletingId === cat.id ? "..." : "Supprimer"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-500 dark:text-slate-400">
                  Aucune catégorie trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
