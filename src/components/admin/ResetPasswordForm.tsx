"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale } from "@/lib/i18n";
import Button from "@/components/ui/Button";

function validatePassword(password: string): string | null {
  if (password.length < 8) return "password_min_length";
  if (!/[a-zA-Z]/.test(password)) return "password_requirements";
  if (!/[0-9]/.test(password)) return "password_requirements";
  return null;
}

export default function ResetPasswordForm() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isMissingToken = !token;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const validationError = validatePassword(password);
    if (validationError) {
      setError(t(validationError));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwords_do_not_match"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t("error_occurred"));
        return;
      }

      setSuccess(true);
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
            {t("reset_password_title")}
          </p>
        </div>

        {isMissingToken ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
              {t("invalid_or_expired_token")}
            </div>
            <Link
              href="/admin/login"
              className="block text-center text-sm text-green-700 hover:text-green-800 hover:underline dark:text-green-400 dark:hover:text-green-300"
            >
              {t("back_to_login")}
            </Link>
          </motion.div>
        ) : success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
              {t("reset_password_success")}
            </div>
            <Link
              href="/admin/login"
              className="block w-full text-center"
            >
              <Button variant="primary" size="lg" className="w-full">
                {t("login")}
              </Button>
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

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300"
              >
                {t("new_password")}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:border-green-400 dark:focus:ring-green-400/30"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                {t("password_requirements")}
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300"
              >
                {t("confirm_password")}
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:border-green-400 dark:focus:ring-green-400/30"
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? t("loading") : t("change_password")}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
