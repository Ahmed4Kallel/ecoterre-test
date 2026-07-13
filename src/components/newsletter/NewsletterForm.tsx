"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/lib/i18n";

interface NewsletterFormProps {
  className?: string;
  compact?: boolean;
}

const checkVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: [0, 1.3, 1],
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export default function NewsletterForm({ className = "", compact = false }: NewsletterFormProps) {
  const { locale, dir, t } = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setMessage(t("newsletter_invalid_email"));
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      if (res.ok) {
        setStatus("success");
        setMessage(t("newsletter_success"));
        setEmail("");
      } else {
        setStatus("error");
        setMessage(t("newsletter_error"));
      }
    } catch {
      setStatus("error");
      setMessage(t("newsletter_error"));
    }
  };

  if (compact) {
    return (
      <div className={className}>
        <h4 className="mb-2 font-semibold text-white dark:text-slate-100">
          {t("newsletter_title")}
        </h4>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("newsletter_placeholder")}
            className="flex-1 rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-green-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700"
            required
          />
          <motion.button
            type="submit"
            disabled={status === "loading"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {status === "loading" ? (
              <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              t("newsletter_subscribe")
            )}
          </motion.button>
        </form>
        <AnimatePresence>
          {message && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-2 text-xs ${
                status === "success"
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {status === "success" && (
                <motion.span
                  className="inline-block mr-1"
                  variants={checkVariants}
                  initial="hidden"
                  animate="visible"
                >
                  ✓
                </motion.span>
              )}
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg bg-gradient-to-br from-green-800 to-green-900 p-8 text-white shadow-lg dark:from-slate-800 dark:to-slate-900 ${className}`}
      dir={dir}
    >
      <div className="mx-auto max-w-lg text-center">
        <h3 className="mb-2 text-2xl font-bold">{t("newsletter_title")}</h3>
        <p className="mb-6 text-green-100 dark:text-slate-300">
          {t("newsletter_subtitle")}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("newsletter_placeholder")}
            className="flex-1 rounded-lg border border-green-600 bg-white/15 px-4 py-3 text-white placeholder-green-200 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30 dark:bg-white/10 dark:border-slate-600 dark:placeholder-slate-400"
            required
          />
          <motion.button
            type="submit"
            disabled={status === "loading"}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-lg bg-white px-6 py-3 font-semibold text-green-900 transition-colors hover:bg-green-50 disabled:opacity-50 cursor-pointer dark:bg-green-500 dark:text-white dark:hover:bg-green-400"
          >
            {status === "loading" ? (
              <svg className="mx-auto h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              t("newsletter_subscribe")
            )}
          </motion.button>
        </form>
        <AnimatePresence>
          {message && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-3 text-sm ${
                status === "success"
                  ? "text-green-200"
                  : "text-red-200"
              }`}
            >
              {status === "success" && (
                <motion.span
                  className="inline-block mr-1"
                  variants={checkVariants}
                  initial="hidden"
                  animate="visible"
                >
                  ✓
                </motion.span>
              )}
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
