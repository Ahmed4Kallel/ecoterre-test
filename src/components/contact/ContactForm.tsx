"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { useLocale } from "@/lib/i18n";
import Button from "@/components/ui/Button";

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const successVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: [0.8, 1.05, 1],
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export default function ContactForm() {
  const { t } = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t("name_required");
    if (!email.trim()) errs.email = t("email_required");
    if (!message.trim()) errs.message = t("message_required");
    return errs;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <motion.div
        className="rounded-lg border border-green-300 bg-green-50 p-8 text-center dark:border-green-800 dark:bg-green-900/20"
        variants={successVariants}
        initial="hidden"
        animate="visible"
      >
        <p className="text-lg font-semibold text-green-800 dark:text-green-400">{t("contact_success")}</p>
        <button
          className="mt-4 text-green-700 underline hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 cursor-pointer"
          onClick={() => setStatus("idle")}
        >
          {t("back")}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      variants={formVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <label htmlFor="contact-name" className="mb-1 block text-sm font-semibold dark:text-slate-200">
          {t("name")} <span className="text-red-500">*</span>
        </label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-4 py-2.5 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400"
          placeholder={t("name")}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <label htmlFor="contact-email" className="mb-1 block text-sm font-semibold dark:text-slate-200">
          {t("email")} <span className="text-red-500">*</span>
        </label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-4 py-2.5 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400"
          placeholder={t("email")}
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <label htmlFor="contact-message" className="mb-1 block text-sm font-semibold dark:text-slate-200">
          {t("message")} <span className="text-red-500">*</span>
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="w-full rounded-md border border-gray-300 px-4 py-2.5 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400"
          placeholder={t("message")}
        />
        {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
      </motion.div>

      {status === "error" && (
        <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {t("contact_error")}
        </p>
      )}

      <Button type="submit" disabled={status === "loading"} size="lg">
        {status === "loading" ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            {t("send")}...
          </span>
        ) : (
          t("send")
        )}
      </Button>
    </motion.form>
  );
}
