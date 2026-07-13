"use client";

import { useState, useRef, type FormEvent } from "react";
import { motion } from "framer-motion";
import { useLocale } from "@/lib/i18n";

interface AdminProfileClientProps {
  user: { name: string; email: string; role: string; createdAt: string; avatar?: string };
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
  const [name, setName] = useState(user.name);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || "");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  async function handleAvatarUpload(file: File) {
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
      setAvatarUrl(data.url);

      const res2 = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: data.url }),
      });
      const data2 = await res2.json().catch(() => ({}));
      if (!res2.ok) throw new Error(data2.error || `Erreur ${res2.status}`);

      setMessage("Photo de profil mise à jour");
      setMessageType("success");
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      setMessage(errMsg);
      setMessageType("error");
    } finally {
      setUploadingAvatar(false);
    }
  }

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{t("profile")}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{t("profile_subtitle")}</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-5 sm:flex-row">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-green-600 to-emerald-700 text-2xl font-bold text-white shadow-md">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                getInitials(user.name)
              )}
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-gray-600 shadow-sm transition-colors hover:bg-gray-200 dark:border-slate-800 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 cursor-pointer"
              title="Changer la photo"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAvatarUpload(file);
              }}
            />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{user.name}</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">{user.email}</p>
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              {user.role === "admin" ? t("admin_role") : t("author_role")}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-slate-800">
            <p className="text-xs text-gray-500 dark:text-slate-400">{t("published_articles_count")}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-slate-100">{stats.publishedCount}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-slate-800">
            <p className="text-xs text-gray-500 dark:text-slate-400">{t("total_articles")}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-slate-100">{stats.articleCount}</p>
          </div>
        </div>

        <p className="mt-4 text-xs text-gray-400 dark:text-slate-500">
          {t("published_at")} {formatDate(user.createdAt)}
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">{t("change_password")}</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">
              {t("current_password")}
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">
              {t("new_password")}
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="••••••••"
            />
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
                messageType === "success"
                  ? "bg-green-50 text-green-700 ring-1 ring-green-200 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-800"
                  : "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-800"
              }`}
            >
              <svg className={`h-4 w-4 flex-shrink-0 ${messageType === "success" ? "text-green-500" : "text-red-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {messageType === "success" ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              {message}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-green-700 hover:to-emerald-800 hover:shadow-md disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t("loading")}
              </>
            ) : (
              t("change_password")
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
