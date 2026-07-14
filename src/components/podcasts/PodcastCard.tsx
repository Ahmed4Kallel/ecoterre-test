"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Article } from "@/lib/types";
import OptimizedImage from "@/components/ui/OptimizedImage";

interface PodcastCardProps {
  podcast: Article;
  locale: string;
  onPlay?: (podcast: Article) => void;
}

export default function PodcastCard({ podcast, locale, onPlay }: PodcastCardProps) {
  const title = podcast.title[locale as "fr" | "ar"];
  const excerpt = podcast.excerpt[locale as "fr" | "ar"];
  const date = podcast.publishedAt
    ? new Date(podcast.publishedAt).toLocaleDateString(
        locale === "fr" ? "fr-TN" : "ar-TN",
        { year: "numeric", month: "long", day: "numeric" }
      )
    : null;

  return (
    <div
      className="group rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-green-700 to-emerald-800">
        {podcast.coverImage ? (
          <OptimizedImage
            src={podcast.coverImage}
            alt={title}
            fill
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg className="h-16 w-16 text-white/30" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1a9 9 0 00-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7a9 9 0 00-9-9z" />
            </svg>
          </div>
        )}

        {podcast.audioUrl && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                onPlay?.(podcast);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-green-600/90 text-white shadow-lg transition-transform hover:bg-green-700 cursor-pointer backdrop-blur-sm"
              aria-label="Play"
            >
              <svg className="h-6 w-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </motion.button>
          </motion.div>
        )}
      </div>

      <div className="p-4">
        <Link href={`/${locale}/article/${podcast.slug}`}>
          <h3 className="mb-2 line-clamp-2 text-base font-bold leading-snug text-gray-900 transition-colors group-hover:text-green-700 dark:text-slate-100 dark:group-hover:text-green-400">
            {title}
          </h3>
        </Link>
        <p className="mb-3 line-clamp-2 text-sm text-gray-500 dark:text-slate-400">{excerpt}</p>
        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-slate-500">
          <div className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Podcast</span>
          </div>
          {date && <span>{date}</span>}
        </div>
      </div>
    </div>
  );
}
