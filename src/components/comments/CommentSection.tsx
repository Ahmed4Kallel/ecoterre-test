"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/lib/i18n";

interface CommentData {
  id: string;
  article_id: string;
  author_name: string;
  author_email: string;
  content: string;
  status: string;
  created_at: string;
}

interface CommentSectionProps {
  articleId: string;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const { t, dir } = useLocale();
  const rtl = dir === "rtl";

  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadComments() {
      try {
        const res = await fetch(
          `/api/comments?article_id=${encodeURIComponent(articleId)}&status=approved`
        );
        if (res.ok && !cancelled) {
          const data = await res.json();
          setComments(data.comments || []);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadComments();
    return () => {
      cancelled = true;
    };
  }, [articleId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          article_id: articleId,
          author_name: name.trim(),
          author_email: email.trim() || "",
          content: content.trim(),
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setName("");
        setEmail("");
        setContent("");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || t("error_occurred"));
      }
    } catch {
      setError(t("error_occurred"));
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("fr-TN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <section className="mt-12 border-t border-gray-200 pt-8 dark:border-slate-700">
      <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-slate-100">
        {t("leave_comment")}
      </h2>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              {t("comment_author")} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              {t("comment_email")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={254}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
            {t("comment_content")} *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            maxLength={5000}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        {success && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-300">
            {t("comment_pending")}
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || success}
          className="cursor-pointer rounded-lg bg-green-700 px-6 py-2 text-sm font-medium text-white transition hover:bg-green-800 disabled:opacity-50"
        >
          {submitting ? "..." : t("submit_comment")}
        </button>
      </form>

      {loading ? (
        <div className="py-8 text-center text-sm text-gray-500 dark:text-slate-400">
          {t("loading")}
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 py-8 text-center text-sm text-gray-500 dark:border-slate-600 dark:text-slate-400">
          {t("no_comments")}
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <div className={`flex items-start gap-3 ${rtl ? "flex-row-reverse" : ""}`}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700 dark:bg-green-900/40 dark:text-green-300">
                  {comment.author_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                      {comment.author_name}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-slate-500">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-slate-300">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
