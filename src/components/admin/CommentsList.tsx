"use client";

import { useState } from "react";
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

  const statusLabel = (s: string) => {
    switch (s) {
      case "approved": return { text: "Approuvé", cls: "bg-green-100 text-green-800" };
      case "rejected": return { text: "Rejeté", cls: "bg-red-100 text-red-800" };
      default: return { text: "En attente", cls: "bg-amber-100 text-amber-800" };
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-600 dark:bg-slate-800 dark:text-slate-400">
          <tr>
            <th className="px-4 py-3 font-medium">Article</th>
            <th className="px-4 py-3 font-medium hidden md:table-cell">Auteur</th>
            <th className="px-4 py-3 font-medium hidden lg:table-cell">Commentaire</th>
            <th className="px-4 py-3 font-medium">Statut</th>
            <th className="px-4 py-3 font-medium hidden sm:table-cell">Date</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
          {comments.map((comment) => {
            const s = statusLabel(comment.status);
            return (
              <tr key={comment.id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3 font-medium text-gray-900 max-w-[150px] truncate dark:text-slate-100">
                  {comment.articleTitle || comment.articleId}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-slate-300">{comment.author}</span>
                    <br />
                    <span className="text-xs text-gray-400 dark:text-slate-500">{comment.email}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 hidden lg:table-cell max-w-[200px] truncate dark:text-slate-400">
                  {comment.content.slice(0, 100)}
                  {comment.content.length > 100 ? "..." : ""}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>
                    {s.text}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell dark:text-slate-400">
                  {new Date(comment.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {comment.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleAction(comment.id, "approve")}
                          disabled={updating === comment.id}
                          className="text-xs text-green-700 hover:underline disabled:opacity-50 cursor-pointer dark:text-green-400 dark:hover:text-green-300"
                        >
                          Approuver
                        </button>
                        <button
                          onClick={() => handleAction(comment.id, "reject")}
                          disabled={updating === comment.id}
                          className="text-xs text-amber-700 hover:underline disabled:opacity-50 cursor-pointer dark:text-amber-400"
                        >
                          Rejeter
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleAction(comment.id, "delete")}
                      disabled={updating === comment.id}
                      className="text-xs text-red-600 hover:underline disabled:opacity-50 cursor-pointer dark:text-red-400 dark:hover:text-red-300"
                    >
                      {updating === comment.id ? "..." : "Suppr."}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {comments.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-gray-500 dark:text-slate-400">
                Aucun commentaire.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
