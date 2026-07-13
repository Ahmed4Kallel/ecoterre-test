"use client";

import { useMemo, type ReactNode } from "react";
import { LocaleContext, createTranslator } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

interface AdminLocaleProviderProps {
  locale: Locale;
  messages: Record<string, string>;
  children: ReactNode;
}

export function AdminLocaleProvider({ locale, messages, children }: AdminLocaleProviderProps) {
  const dir: "ltr" | "rtl" = locale === "ar" ? "rtl" : "ltr";
  const t = useMemo(() => createTranslator(locale, messages), [locale, messages]);

  const value = useMemo(
    () => ({ locale, dir, t, switchLocale: () => {} }),
    [locale, dir, t]
  );

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}
