import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { getSiteUrl } from "@/lib/seo";
import { getCategories } from "@/lib/data";
import frMessages from "@/i18n/fr/common.json";
import arMessages from "@/i18n/ar/common.json";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { ToastProvider } from "@/components/ui/ToastProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Navigation from "@/components/layout/Navigation";
import BackToTop from "@/components/ui/BackToTop";
import SkipToContent from "@/components/ui/SkipToContent";

type Params = Promise<{ locale: string }>;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { locale } = await params;
  const messages = locale === "ar" ? arMessages : frMessages;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const session = await getSession();
  const user = session ? { name: session.name, role: session.role } : null;

  const categories = await getCategories();

  return (
    <div dir={dir} className="min-h-full flex flex-col">
      <LocaleProvider locale={locale as "fr" | "ar"} messages={messages}>
        <ThemeProvider>
          <ToastProvider>
            <SkipToContent />
            <Header user={user} categories={categories} />
            <Navigation categories={categories} />
            <main id="main-content" className="flex-1 bg-white dark:bg-slate-900 transition-colors">{children}</main>
            <Footer categories={categories} />
            <BackToTop />
          </ToastProvider>
        </ThemeProvider>
      </LocaleProvider>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = locale === "ar" ? arMessages : frMessages;
  const baseUrl = getSiteUrl();
  return {
    title: {
      default: messages.site_name,
      template: `%s | ${messages.site_name}`,
    },
    description: messages.site_description,
    openGraph: {
      siteName: messages.site_name,
      locale: locale === "ar" ? "ar_TN" : "fr_TN",
      type: "website",
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        fr: `${baseUrl}/fr`,
        ar: `${baseUrl}/ar`,
      },
    },
    robots: { index: true, follow: true },
  };
}
