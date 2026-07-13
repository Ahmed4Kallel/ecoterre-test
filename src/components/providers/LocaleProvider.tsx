"use client";

import { useCallback, useMemo, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LocaleContext, createTranslator, type Locale } from "@/lib/i18n";

interface LocaleProviderProps {
  locale: Locale;
  messages: Record<string, string>;
  children: ReactNode;
}

export function LocaleProvider({ locale, messages, children }: LocaleProviderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const dir: "ltr" | "rtl" = locale === "ar" ? "rtl" : "ltr";

  const t = useMemo(() => createTranslator(locale, messages), [locale, messages]);

  const switchLocale = useCallback(
    (newLocale: Locale) => {
      const newPathname = pathname.replace(`/${locale}/`, `/${newLocale}/`);
      router.push(newPathname);
    },
    [locale, pathname, router]
  );

  const value = useMemo(
    () => ({ locale, dir, t, switchLocale }),
    [locale, dir, t, switchLocale]
  );

  return (
    <LocaleContext.Provider value={value}>
      <AnimatePresence mode="wait">
        <motion.div
          key={locale}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </LocaleContext.Provider>
  );
}
