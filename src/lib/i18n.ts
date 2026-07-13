"use client";

import { useCallback, useContext, createContext, type ReactNode } from "react";

export type Locale = "fr" | "ar";

interface LocaleContextType {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: (key: string) => string;
  switchLocale: (locale: Locale) => void;
}

export const LocaleContext = createContext<LocaleContextType>({
  locale: "fr",
  dir: "ltr",
  t: (key) => key,
  switchLocale: () => {},
});

export function useLocale() {
  return useContext(LocaleContext);
}

export function createTranslator(locale: Locale, messages: Record<string, string>) {
  return (key: string): string => {
    return messages[key] || key;
  };
}
