import Link from "next/link";
import type { Metadata } from "next";
import { getPublishedArticles } from "@/lib/data";
import frMessages from "@/i18n/fr/common.json";
import arMessages from "@/i18n/ar/common.json";
import { formatMetaTitle, formatMetaDescription, getSiteUrl } from "@/lib/seo";
import PodcastList from "./PodcastList";

type Params = Promise<{ locale: string }>;

export default async function PodcastsPage({ params }: { params: Params }) {
  const { locale } = await params;
  const messages = locale === "ar" ? arMessages : frMessages;
  const dir = locale === "ar" ? "rtl" : "ltr";

  const podcasts = await getPublishedArticles({ category: "podcast" });

  const backArrowPath =
    dir === "rtl" ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link
        href={`/${locale}`}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-green-800 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={backArrowPath} />
        </svg>
        {messages.back}
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
          {messages.podcast || "Podcasts"}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-slate-400">
          {messages.podcasts_description || (locale === "ar"
            ? "استمع إلى أحدث حلقات البودكاست"
            : "Écoutez nos derniers épisodes de podcast")}
        </p>
      </div>

      {podcasts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center dark:border-slate-700">
          <p className="text-gray-500 dark:text-slate-400">
            {messages.no_podcasts || (locale === "ar" ? "لا توجد بودكاستات بعد" : "Aucun podcast pour le moment.")}
          </p>
        </div>
      ) : (
        <PodcastList podcasts={podcasts} locale={locale} />
      )}
    </div>
  );
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const messages = locale === "ar" ? arMessages : frMessages;
  const baseUrl = getSiteUrl();
  const title = messages.podcast || (locale === "ar" ? "بودكاست" : "Podcasts");
  const description = locale === "ar"
    ? "استمع إلى أحدث حلقات البودكاست من إيكوتير"
    : "Écoutez nos derniers épisodes de podcast sur Ecoterre";

  return {
    title: formatMetaTitle(title, messages.site_name),
    description: formatMetaDescription(description),
    openGraph: {
      title: `${title} | ${messages.site_name}`,
      description,
      url: `${baseUrl}/${locale}/podcasts`,
      siteName: messages.site_name,
      locale: locale === "ar" ? "ar_TN" : "fr_TN",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${title} | ${messages.site_name}`,
      description,
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/podcasts`,
      languages: {
        fr: `${baseUrl}/fr/podcasts`,
        ar: `${baseUrl}/ar/podcasts`,
      },
    },
    robots: { index: true, follow: true },
  };
}
