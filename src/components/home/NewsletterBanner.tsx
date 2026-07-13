"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { useLocale } from "@/lib/i18n";

export default function NewsletterBanner() {
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

  return (
    <motion.section
      className="rounded-2xl bg-gradient-to-r from-green-700 via-green-800 to-emerald-700 p-8 text-white shadow-lg sm:p-12"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      dir={dir}
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="mb-2 text-2xl font-extrabold sm:text-3xl">
          {locale === "ar" ? "ابق على اطلاع" : "Restez informé"}
        </h2>
        <p className="mb-6 text-green-100">
          {locale === "ar"
            ? "اشترك في نشرتنا البريدية لتتوصل بأحدث المقالات والتقارير"
            : "Abonnez-vous à notre newsletter pour recevoir nos derniers articles et analyses"}
        </p>
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("newsletter_placeholder")}
            className="flex-1 rounded-lg border border-green-600 bg-white/15 px-4 py-3 text-white placeholder-green-200 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30"
            required
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-lg bg-white px-6 py-3 font-semibold text-green-900 transition-colors hover:bg-green-50 disabled:opacity-50"
          >
            {status === "loading" ? (
              <svg
                className="mx-auto h-5 w-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              t("newsletter_subscribe")
            )}
          </button>
        </form>
        {message && (
          <p
            className={`mt-3 text-sm ${
              status === "success" ? "text-green-200" : "text-yellow-200"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </motion.section>
  );
}
