"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale } from "@/lib/i18n";
import Button from "@/components/ui/Button";

export default function ForgotPasswordForm() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t("error_occurred"));
        return;
      }

      setSent(true);
    } catch {
      setError(t("error_occurred"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-slate-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg dark:bg-slate-800 dark:shadow-slate-900/50"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-green-800 dark:text-green-400">
            {t("site_name")}
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
            {t("forgot_password_title")}
          </p>
        </div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
              {t("reset_link_sent")}
            </div>
            <Link
              href="/admin/login"
              className="block text-center text-sm text-green-700 hover:text-green-800 hover:underline dark:text-green-400 dark:hover:text-green-300"
            >
              {t("back_to_login")}
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
              >
                {error}
              </motion.div>
            )}

            <p className="text-sm text-gray-600 dark:text-slate-400">
              {t("forgot_password_description")}
            </p>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300"
              >
                {t("email")}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:border-green-400 dark:focus:ring-green-400/30"
                placeholder="admin@ecoterre.com"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? t("loading") : t("send_reset_link")}
            </Button>

            <div className="text-center">
              <Link
                href="/admin/login"
                className="text-sm text-green-700 hover:text-green-800 hover:underline dark:text-green-400 dark:hover:text-green-300"
              >
                {t("back_to_login")}
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
