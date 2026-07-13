"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useLocale } from "@/lib/i18n";

interface SearchBarProps {
  placeholder?: string;
}

export default function SearchBar({ placeholder }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const { locale, t } = useLocale();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/${locale}/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="relative w-full"
      role="search"
      animate={{ scale: focused ? 1.02 : 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder || t("search_placeholder")}
        className="w-full rounded-md border border-gray-300 bg-white py-2 pe-10 ps-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-600/30"
      />
      <button
        type="submit"
        className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-400 hover:text-green-700 transition-colors cursor-pointer"
        aria-label={t("search")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>
    </motion.form>
  );
}
