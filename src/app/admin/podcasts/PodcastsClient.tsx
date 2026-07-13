"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import type { Article } from "@/lib/types";

interface PodcastsClientProps {
  podcasts: Article[];
}

export default function PodcastsClient({ podcasts }: PodcastsClientProps) {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{t("sidebar_podcasts")}</h1>

      {podcasts.length === 0 ? (
        <p className="text-gray-500 dark:text-slate-400">{t("no_podcasts")}</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600 dark:bg-slate-800 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">{t("title")}</th>
                  <th className="px-4 py-3 font-medium">{t("author")}</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">{t("date")}</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {podcasts.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate dark:text-slate-100">
                      {article.title.fr}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-400">
                      {article.authorName}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell dark:text-slate-400">
                      {new Date(article.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="text-sm text-green-700 hover:text-green-800 hover:underline dark:text-green-400 dark:hover:text-green-300"
                      >
                        {t("edit")}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
