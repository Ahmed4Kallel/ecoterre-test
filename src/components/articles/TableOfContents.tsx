"use client";

import { useState, useEffect, useMemo } from "react";
import { useLocale } from "@/lib/i18n";

interface TocItem {
  id: string;
  text: string;
}

interface TableOfContentsProps {
  html?: string;
  headings?: TocItem[];
}

export default function TableOfContents({ html, headings: propHeadings }: TableOfContentsProps) {
  const { t, dir } = useLocale();
  const [activeId, setActiveId] = useState<string>("");
  const rtl = dir === "rtl";

  const items = useMemo(() => {
    if (propHeadings && propHeadings.length > 0) return propHeadings;
    if (!html) return [];
    const headings: TocItem[] = [];
    const regex = /<h2\b([^>]*)>(.*?)<\/h2>/gi;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(html)) !== null) {
      const attrs = match[1];
      const text = match[2].replace(/<[^>]*>/g, "").trim();
      const idMatch = attrs.match(/id="([^"]*)"/);
      const id = idMatch
        ? idMatch[1]
        : `toc-${text
            .toLowerCase()
            .replace(/[^a-z0-9\u0600-\u06FF\s]/g, "")
            .replace(/\s+/g, "-")}-${headings.length}`;
      headings.push({ id, text });
    }
    return headings;
  }, [html, propHeadings]);

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav className="rounded-xl border border-gray-200 bg-white p-4 lg:p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h4 className="mb-3 text-sm font-bold text-gray-800 dark:text-slate-300">
        {t("table_of_contents")}
      </h4>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(item.id);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                  setActiveId(item.id);
                }
              }}
              className={`block text-sm py-1 px-2 rounded-md transition-colors ${
                rtl ? "border-r-2" : "border-l-2"
              } ${
                activeId === item.id
                  ? "border-green-700 text-green-800 bg-green-50 font-medium dark:border-green-400 dark:text-green-300 dark:bg-green-900/20"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
