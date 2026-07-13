"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale } from "@/lib/i18n";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const { dir } = useLocale();
  const rtl = dir === "rtl";

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
        <motion.ol
          className="flex flex-wrap items-center gap-1 text-sm text-gray-500 dark:text-slate-400"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <motion.li
                key={index}
                className="flex items-center gap-1"
                variants={itemVariants}
              >
                {index > 0 && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`shrink-0 text-gray-400 dark:text-slate-500 ${rtl ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                )}
                {isLast || !item.href ? (
                  <span className="font-medium text-gray-700 dark:text-slate-300">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-green-700 dark:hover:text-green-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </motion.li>
            );
          })}
        </motion.ol>
    </nav>
  );
}
