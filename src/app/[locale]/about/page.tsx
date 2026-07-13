import Link from "next/link";
import type { Metadata } from "next";
import frMessages from "@/i18n/fr/common.json";
import arMessages from "@/i18n/ar/common.json";
import { formatMetaTitle, getSiteUrl } from "@/lib/seo";

type Params = Promise<{ locale: string }>;

export default async function AboutPage({ params }: { params: Params }) {
  const { locale } = await params;
  const messages = locale === "ar" ? arMessages : frMessages;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const backArrowPath =
    dir === "rtl"
      ? "M9 5l7 7-7 7"
      : "M15 19l-7-7 7-7";

  const t = (key: string) => (messages as Record<string, string>)[key] || key;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
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

      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-slate-100">
        {t("about")}
      </h1>

      <div className="prose dark:prose-invert max-w-none space-y-4 text-gray-700 dark:text-slate-300">
        <p>
          {t("notre_mission_text")}
        </p>

        <h2 className="mt-8 text-xl font-bold text-green-800 dark:text-green-400">
          {t("notre_mission")}
        </h2>
        <p>
          {t("about_description")}
        </p>

        <h2 className="mt-8 text-xl font-bold text-green-800 dark:text-green-400">
          {t("about_contact")}
        </h2>
        <p>
          {t("about_contact_text")}{" "}
          <Link
            href={`/${locale}/contact`}
            className="text-green-700 hover:text-green-800 underline dark:text-green-400 dark:hover:text-green-300"
          >
            {t("contact")}
          </Link>
          .
        </p>
      </div>
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
    title: formatMetaTitle(messages.about, messages.site_name),
    description:
      locale === "ar"
        ? "تعرف على إيكوتير، بوابتك للأخبار البيئية والاقتصادية في تونس"
        : "Découvrez Ecoterre, votre portail d'actualités environnementales et économiques en Tunisie",
    openGraph: {
      title: `${messages.about} | ${messages.site_name}`,
      url: `${baseUrl}/${locale}/about`,
      siteName: messages.site_name,
      locale: locale === "ar" ? "ar_TN" : "fr_TN",
      type: "website",
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/about`,
      languages: {
        fr: `${baseUrl}/fr/about`,
        ar: `${baseUrl}/ar/about`,
      },
    },
    robots: { index: true, follow: true },
  };
}
