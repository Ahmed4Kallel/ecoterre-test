"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/lib/i18n";
import type { Category } from "@/lib/types";
import SearchBar from "./SearchBar";
import LanguageSwitcher from "./LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeProvider";

interface UserInfo {
  name: string;
  role: string;
}

interface HeaderProps {
  user?: UserInfo | null;
  categories?: Category[];
}

const easeOut = "easeOut" as const;

const logoVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.08, transition: { duration: 0.3, ease: easeOut } },
};

const navLinkVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.25, ease: easeOut },
  }),
};

const mobileMenuVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: "auto", opacity: 1, transition: { duration: 0.3, ease: "easeOut" as const } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.2, ease: "easeInOut" as const } },
};

const mobileItemVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.2, ease: "easeOut" as const },
  }),
};

export default function Header({ user = null, categories = [] }: HeaderProps) {
  const { locale, dir, t } = useLocale();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const rtl = dir === "rtl";
  const today = new Date().toLocaleDateString(
    locale === "fr" ? "fr-TN" : "ar-TN",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  );

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        closeMenu();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userMenuOpen]);

  async function handleLogout() {
    setUserMenuOpen(false);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // continue
    }
    router.push(`/${locale}`);
    router.refresh();
  }

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);
  const mobileItems = [
    { label: t("home"), href: `/${locale}` },
    ...sortedCategories.map((cat) => ({
      label: cat.name[locale],
      href: `/${locale}/category/${cat.slug}`,
    })),
    { label: t("contact"), href: `/${locale}/contact` },
    { label: t("search"), href: `/${locale}/search`, separator: true },
  ];

  return (
    <header className="bg-green-800 text-white dark:bg-slate-900" dir={dir}>
      <div className="hidden items-center justify-between border-b border-green-700 px-4 py-1.5 text-xs md:flex dark:border-slate-700">
        <span>
          {today}
          {" — "}
          {locale === "fr" ? "Tunisie" : "تونس"}
        </span>
        <div className="flex items-center gap-4">
          <Link
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-300 transition-colors"
            aria-label="Facebook"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </Link>
          <Link
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-300 transition-colors"
            aria-label="X (Twitter)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </Link>
          <Link
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-300 transition-colors"
            aria-label="LinkedIn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </Link>
          <Link
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-300 transition-colors"
            aria-label="YouTube"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </Link>
          <LanguageSwitcher />
          <ThemeToggle />
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1 rounded bg-white/15 px-2 py-0.5 font-semibold hover:bg-white/25 transition-colors cursor-pointer"
              >
                {user.name}
                <svg
                  className={`h-3 w-3 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 rounded-md bg-white shadow-lg ring-1 ring-black/5 dark:bg-slate-800 dark:ring-slate-700 z-50"
                  >
                    <div className="px-4 py-2.5 text-xs text-gray-500 dark:text-slate-400 border-b border-gray-100 dark:border-slate-700">
                      {t("welcome")}, {user.name}
                    </div>
                      <Link
                        href="/admin/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                      >
                        <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {t("user_menu_profile")}
                      </Link>
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                    >
                      <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zm10-3a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
                      </svg>
                      {t("user_menu_dashboard")}
                    </Link>
                    <div className="border-t border-gray-100 dark:border-slate-700">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {t("user_menu_logout")}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/admin/login"
              className="rounded bg-white/15 px-2 py-0.5 font-semibold hover:bg-white/25 transition-colors"
            >
              {t("login")}
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3">
        <motion.div
          variants={logoVariants}
          initial="rest"
          whileHover="hover"
          whileTap={{ scale: 0.97 }}
        >
          <Link
            href={`/${locale}`}
            className="text-xl font-extrabold tracking-tight"
          >
            E<span className="text-green-300">co</span>terre
          </Link>
        </motion.div>

        <div className="hidden w-full max-w-md px-6 md:block">
          <SearchBar />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <div className="mr-1 ml-1 w-8 h-8">
            <ThemeToggle />
          </div>
          <div className="w-28">
            <SearchBar />
          </div>
          <button
            ref={buttonRef}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex items-center rounded-md p-2 text-white hover:bg-green-700 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? t("close_menu") : t("open_menu")}
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="overflow-hidden border-t border-green-700 bg-green-800 md:hidden dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="px-4 pb-4 pt-3">
              <div className="mb-3">
                <SearchBar />
              </div>
              <nav className="flex flex-col gap-1" role="navigation" aria-label="Mobile navigation">
                {mobileItems.map((item, i) => (
                  <div key={`${item.label}-${i}`}>
                    {item.separator && (
                      <hr className="my-2 border-green-700 dark:border-slate-600" />
                    )}
                    <motion.div
                      variants={mobileItemVariants}
                      initial="hidden"
                      animate="visible"
                      custom={i}
                    >
                      <Link
                        href={item.href}
                        onClick={closeMenu}
                        className="rounded px-3 py-2 text-sm font-semibold hover:bg-green-700 dark:hover:bg-slate-700 transition-colors block"
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  </div>
                ))}
                {user ? (
                  <>
                    <motion.div
                      variants={mobileItemVariants}
                      initial="hidden"
                      animate="visible"
                      custom={mobileItems.length}
                    >
                      <div className="rounded px-3 py-2 text-xs font-semibold text-green-200 dark:text-green-400">
                        {t("welcome")}, {user.name}
                      </div>
                    </motion.div>
                    <motion.div
                      variants={mobileItemVariants}
                      initial="hidden"
                      animate="visible"
                      custom={mobileItems.length + 1}
                    >
                      <Link
                        href="/admin"
                        onClick={closeMenu}
                        className="rounded px-3 py-2 text-sm font-semibold hover:bg-green-700 dark:hover:bg-slate-700 transition-colors block"
                      >
                        {t("user_menu_dashboard")}
                      </Link>
                    </motion.div>
                    <motion.div
                      variants={mobileItemVariants}
                      initial="hidden"
                      animate="visible"
                      custom={mobileItems.length + 2}
                    >
                      <Link
                        href="/admin/profile"
                        onClick={closeMenu}
                        className="rounded px-3 py-2 text-sm font-semibold hover:bg-green-700 dark:hover:bg-slate-700 transition-colors block"
                      >
                        {t("user_menu_profile")}
                      </Link>
                    </motion.div>
                  </>
                ) : (
                  <motion.div
                    variants={mobileItemVariants}
                    initial="hidden"
                    animate="visible"
                    custom={mobileItems.length}
                  >
                    <Link
                      href="/admin/login"
                      onClick={closeMenu}
                      className="rounded px-3 py-2 text-sm font-semibold hover:bg-green-700 dark:hover:bg-slate-700 transition-colors block"
                    >
                      {t("login")}
                    </Link>
                  </motion.div>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
