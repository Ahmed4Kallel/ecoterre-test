import Link from "next/link";
import type { Metadata } from "next";
import frMessages from "@/i18n/fr/common.json";
import arMessages from "@/i18n/ar/common.json";
import { formatMetaTitle, getSiteUrl } from "@/lib/seo";
import ContactForm from "@/components/contact/ContactForm";

type Params = Promise<{ locale: string }>;

export default async function ContactPage({ params }: { params: Params }) {
  const { locale } = await params;
  const messages = locale === "ar" ? arMessages : frMessages;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const backArrowPath =
    dir === "rtl"
      ? "M9 5l7 7-7 7"
      : "M15 19l-7-7 7-7";

  const t = (key: string) => (messages as Record<string, string>)[key] || key;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href={`/${locale}`}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-green-800 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={backArrowPath}
          />
        </svg>
        {t("back")}
      </Link>

      <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-slate-100">
        {t("contact")}
      </h1>
      <p className="mb-8 text-gray-600 dark:text-slate-400">
        {t("about_contact_text")}
      </p>

      <ContactForm />
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
  const description =
    locale === "ar"
      ? "اتصل بفريق إيكوتير"
      : "Contactez l'équipe d'Ecoterre";
  return {
    title: formatMetaTitle(messages.contact, messages.site_name),
    description,
    openGraph: {
      title: `${messages.contact} | ${messages.site_name}`,
      description,
      url: `${baseUrl}/${locale}/contact`,
      siteName: messages.site_name,
      locale: locale === "ar" ? "ar_TN" : "fr_TN",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${messages.contact} | ${messages.site_name}`,
      description,
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/contact`,
      languages: {
        fr: `${baseUrl}/fr/contact`,
        ar: `${baseUrl}/ar/contact`,
      },
    },
    robots: { index: true, follow: true },
  };
}
