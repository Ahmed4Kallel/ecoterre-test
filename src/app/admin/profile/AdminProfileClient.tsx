"use client";

import { useState, type FormEvent } from "react";
import { useLocale } from "@/lib/i18n";
import Button from "@/components/ui/Button";

interface AdminProfileClientProps {
  user: { name: string; email: string; role: string; createdAt: string };
  stats: { articleCount: number; publishedCount: number };
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function AdminProfileClient({ user, stats }: AdminProfileClientProps) {
  const { t } = useLocale();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(false);

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || t("invalid_credentials"));
        setMessageType("error");
        return;
      }

      setMessage(t("settings_saved"));
      setMessageType("success");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      setMessage(t("invalid_credentials"));
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{t("profile")}</h1>

      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-800 text-xl font-bold text-white">
            {getInitials(user.name)}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{user.name}</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">{user.email}</p>
            <span className="mt-1 inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300">
              {user.role === "admin" ? t("admin_role") : t("author_role")}
            </span>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-md bg-gray-50 p-4 dark:bg-slate-800">
            <p className="text-xs text-gray-500 dark:text-slate-400">{t("published_articles_count")}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-slate-100">{stats.publishedCount}</p>
          </div>
          <div className="rounded-md bg-gray-50 p-4 dark:bg-slate-800">
            <p className="text-xs text-gray-500 dark:text-slate-400">{t("total_articles")}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-slate-100">{stats.articleCount}</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 dark:text-slate-500 mb-6">
          {t("published_at")} {formatDate(user.createdAt)}
        </p>

        <hr className="mb-6 border-gray-200 dark:border-slate-700" />

        <h3 className="mb-4 font-semibold text-gray-900 dark:text-slate-100">{t("password")}</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              {t("password")}
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              {t("new_password")}
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              placeholder="••••••••"
            />
          </div>

          {message && (
            <p
              className={`rounded-md p-3 text-sm ${
                messageType === "success"
                  ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                  : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
              }`}
            >
              {message}
            </p>
          )}

          <Button type="submit" disabled={loading} size="sm">
            {loading ? t("loading") : t("save")}
          </Button>
        </form>
      </div>
    </div>
  );
}
