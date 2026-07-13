"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale } from "@/lib/i18n";
import type { Category } from "@/lib/types";

interface NavigationProps {
  categories: Category[];
  currentCategory?: string;
}

export default function Navigation({
  categories,
  currentCategory,
}: NavigationProps) {
  const { locale, dir } = useLocale();

  const sorted = [...categories].sort((a, b) => a.order - b.order);

  return (
    <nav
      className="overflow-x-auto border-b border-gray-200 bg-white dark:bg-slate-900 dark:border-slate-700"
      dir={dir}
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 py-2">
        {sorted.map((cat) => {
          const isActive = currentCategory === cat.slug;
          return (
            <Link
              key={cat.id}
              href={`/${locale}/category/${cat.slug}`}
              className={`relative whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-green-800 text-white dark:bg-green-700"
                  : "text-gray-700 hover:bg-green-50 hover:text-green-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-green-400"
              }`}
              style={{ position: "relative" }}
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="inline-block"
              >
                {cat.name[locale]}
              </motion.span>
              {isActive && (
                <motion.div
                  layoutId="nav-active-indicator"
                  className="absolute inset-0 rounded-md bg-green-800 dark:bg-green-700"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  style={{ zIndex: -1 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
