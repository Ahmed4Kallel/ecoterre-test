"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale } from "@/lib/i18n";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
}: PaginationProps) {
  const { dir, t } = useLocale();

  if (totalPages <= 1) return null;

  const prevUrl = `${baseUrl}?page=${currentPage - 1}`;
  const nextUrl = `${baseUrl}?page=${currentPage + 1}`;

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  const rtl = dir === "rtl";

  return (
    <nav className="flex items-center justify-center gap-1 py-8" aria-label="Pagination">
      <motion.div
        whileHover={currentPage > 1 ? { x: rtl ? 3 : -3 } : undefined}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Link
          href={prevUrl}
          className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            currentPage <= 1
              ? "pointer-events-none text-gray-400"
              : "text-green-800 hover:bg-green-50"
          }`}
          aria-disabled={currentPage <= 1}
          tabIndex={currentPage <= 1 ? -1 : 0}
        >
          {rtl ? "→" : "←"} {t("pagination_prev")}
        </Link>
      </motion.div>

      {pages.map((page, idx) =>
        page === "..." ? (
          <span key={`dots-${idx}`} className="px-2 text-gray-400">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={`${baseUrl}?page=${page}`}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors ${
              page === currentPage
                ? "bg-green-800 text-white"
                : "text-gray-700 hover:bg-green-50"
            }`}
          >
            <motion.span
              whileHover={page === currentPage ? { scale: 1.1 } : undefined}
              transition={{ duration: 0.2 }}
            >
              {page}
            </motion.span>
          </Link>
        )
      )}

      <motion.div
        whileHover={currentPage < totalPages ? { x: rtl ? -3 : 3 } : undefined}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Link
          href={nextUrl}
          className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            currentPage >= totalPages
              ? "pointer-events-none text-gray-400"
              : "text-green-800 hover:bg-green-50"
          }`}
          aria-disabled={currentPage >= totalPages}
          tabIndex={currentPage >= totalPages ? -1 : 0}
        >
          {t("pagination_next")} {rtl ? "←" : "→"}
        </Link>
      </motion.div>
    </nav>
  );
}
