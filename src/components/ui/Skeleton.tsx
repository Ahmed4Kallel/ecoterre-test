"use client";

import { motion } from "framer-motion";

interface SkeletonProps {
  variant?: "text" | "title" | "image" | "card" | "article-list";
  width?: string;
  height?: string;
  count?: number;
  className?: string;
}

function SkeletonBox({ width, height, className = "" }: { width?: string; height?: string; className?: string }) {
  return (
    <motion.div
      className={`rounded bg-gray-200 dark:bg-slate-700 ${className}`}
      style={{ width: width || "100%", height: height || "1rem" }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
    />
  );
}

export default function Skeleton({ variant = "text", width, height, count = 1, className = "" }: SkeletonProps) {
  switch (variant) {
    case "text":
      return (
        <div className={`flex flex-col gap-2 ${className}`}>
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonBox key={i} width={width || `${[85, 70, 95, 60, 80][i % 5]}%`} height={height || "0.875rem"} />
          ))}
        </div>
      );

    case "title":
      return (
        <div className={`flex flex-col gap-2 ${className}`}>
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonBox key={i} width={width || "60%"} height={height || "1.5rem"} />
          ))}
        </div>
      );

    case "image":
      return (
        <div className={`flex flex-col gap-3 ${className}`}>
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonBox key={i} width={width || "100%"} height={height || "12rem"} className="rounded-lg" />
          ))}
        </div>
      );

    case "card":
      return (
        <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-slate-800">
              <SkeletonBox height="12rem" className="rounded-none" />
              <div className="p-4 space-y-3">
                <SkeletonBox width="80%" height="1.25rem" />
                <SkeletonBox width="100%" height="0.875rem" />
                <SkeletonBox width="60%" height="0.875rem" />
                <div className="flex justify-between pt-2">
                  <SkeletonBox width="30%" height="0.75rem" />
                  <SkeletonBox width="25%" height="0.75rem" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );

    case "article-list":
      return (
        <div className={`space-y-4 ${className}`}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 rounded-lg border border-gray-200 p-4 dark:border-slate-700">
              <SkeletonBox width="80px" height="80px" className="shrink-0 rounded-md" />
              <div className="flex-1 space-y-2">
                <SkeletonBox width="70%" height="1rem" />
                <SkeletonBox width="90%" height="0.75rem" />
                <SkeletonBox width="40%" height="0.75rem" />
              </div>
            </div>
          ))}
        </div>
      );

    default:
      return <SkeletonBox width={width} height={height} className={className} />;
  }
}
