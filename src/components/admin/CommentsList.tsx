"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Article, Comment } from "@/lib/types";

interface CommentsListProps {
  comments: (Comment & { articleTitle?: string })[];
}

export default function CommentsList({ comments: initialComments }: CommentsListProps) {
  const [comments, setComments] = useState(initialComments);
  const [updating, setUpdating] = useState<string | null>(null);

  async function handleAction(id: string, action: "approve" | "reject" | "delete") {
    setUpdating(id);
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: action === "delete" ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body:
          action === "delete"
            ? undefined
            : JSON.stringify({ status: action === "approve" ? "approved" : "rejected" }),
      });
      if (res.ok) {
        if (action === "delete") {
          setComments((prev) => prev.filter((c) => c.id !== id));
        } else {
          setComments((prev) =>
            prev.map((c) =>
              c.id === id
                ? { ...c, status: action === "approve" ? "approved" : "rejected" }
                : c
            )
          );
        }
      }
    } catch {
      // ignore
    } finally {
      setUpdating(null);
    }
  }

  const statusConfig = (s: string) => {
    switch (s) {
      case "approved": return { text: "Approuvé", dot: "bg-green-500", bg: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300" };
      case "rejected": return { text: "Rejeté", dot: "bg-red-500", bg: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300" };
      default: return { text: "En attente", dot: "bg-amber-500", bg: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" };
    }
  };

  const pendingCount = comments.filter((c) => c.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Commentaires</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {pendingCount} en attente
              </span>
            )}
            {pendingCount === 0 && `${comments.length} commentaire${comments.length > 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 dark:border-slate-700 dark:bg-slate-800/50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Article</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 hidden md:table-cell">Auteur</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 hidden lg:table-cell">Commentaire</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Statut</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 hidden sm:table-cell">Date</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {comments.map((comment, idx) => {
                const s = statusConfig(comment.status);
                const isPending = comment.status === "pending";
                return (
                  <motion.tr
                    key={comment.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.03 * idx }}
                    className={`group hover:bg-gray-50/80 dark:hover:bg-slate-800/50 ${isPending ? "bg-amber-50/30 dark:bg-amber-900/10" : ""}`}
                  >
                    <td className="px-5 py-4 max-w-[160px]">
                      <p className="truncate font-medium text-gray-900 dark:text-slate-100">
                        {comment.articleTitle || comment.articleId}
                      </p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-slate-300">{comment.author}</span>
                        <br />
                        <span className="text-xs text-gray-400 dark:text-slate-500">{comment.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 hidden lg:table-cell max-w-[220px] dark:text-slate-400">
                      <span className="block truncate">
                        {comment.content}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${s.bg}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                        {s.text}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 hidden sm:table-cell dark:text-slate-400 whitespace-nowrap">
                      {new Date(comment.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleAction(comment.id, "approve")}
                              disabled={updating === comment.id}
                              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-50 dark:text-green-400 dark:hover:bg-green-900/30 cursor-pointer"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Approuver
                            </button>
                            <button
                              onClick={() => handleAction(comment.id, "reject")}
                              disabled={updating === comment.id}
                              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50 dark:text-amber-400 dark:hover:bg-amber-900/30 cursor-pointer"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Rejeter
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleAction(comment.id, "delete")}
                          disabled={updating === comment.id}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/30 cursor-pointer"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          {updating === comment.id ? "..." : "Suppr."}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {comments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-500 dark:text-slate-400">
                    <svg className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Aucun commentaire.
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
