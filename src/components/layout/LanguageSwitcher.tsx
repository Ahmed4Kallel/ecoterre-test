"use client";

import { useLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { locale, switchLocale } = useLocale();

  const locales: { code: Locale; label: string }[] = [
    { code: "fr", label: "FR" },
    { code: "ar", label: "AR" },
  ];

  return (
    <div className="flex items-center gap-1">
      {locales.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => switchLocale(code)}
          className={`rounded px-2 py-1 text-xs font-semibold transition-colors ${
            locale === code
              ? "bg-green-800 text-white"
              : "text-gray-300 hover:text-white"
          }`}
          aria-label={code === "fr" ? "Français" : "العربية"}
          aria-current={locale === code ? "true" : undefined}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
