"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/lib/i18n";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastData {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastItemProps {
  toast: ToastData;
  onRemove: (id: string) => void;
}

const typeConfig: Record<ToastType, { bg: string; icon: string; defaultLabel: string }> = {
  success: {
    bg: "bg-green-600 dark:bg-green-700",
    icon: "M20 6 9 17l-5-5",
    defaultLabel: "Success",
  },
  error: {
    bg: "bg-red-600 dark:bg-red-700",
    icon: "M18 6 6 18M6 6l12 12",
    defaultLabel: "Error",
  },
  info: {
    bg: "bg-blue-600 dark:bg-blue-700",
    icon: "M12 16v-4M12 8h.01",
    defaultLabel: "Info",
  },
  warning: {
    bg: "bg-yellow-500 dark:bg-yellow-600",
    icon: "M12 9v4M12 17h.01",
    defaultLabel: "Warning",
  },
};

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), 3700);
    const removeTimer = setTimeout(() => onRemove(toast.id), 4000);
    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, onRemove]);

  const config = typeConfig[toast.type];

  return (
    <motion.div
      layout
      initial={{ x: 100, opacity: 0 }}
      animate={exiting ? { x: 100, opacity: 0 } : { x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${config.bg}`}
      role="alert"
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
        className="shrink-0"
        aria-hidden="true"
      >
        <path d={config.icon} />
      </svg>
      <span>{toast.message}</span>
      <button
        onClick={() => setExiting(true)}
        className="ml-auto shrink-0 rounded p-0.5 hover:bg-white/20 transition-colors cursor-pointer"
        aria-label="Dismiss"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>
    </motion.div>
  );
}

export default function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}) {
  const { dir } = useLocale();

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed top-4 z-[100] flex flex-col gap-2"
      style={{
        maxWidth: "380px",
        [dir === "rtl" ? "left" : "right"]: "1rem",
      }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={onRemove} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
