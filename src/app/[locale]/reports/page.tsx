import Link from "next/link";
import type { Metadata } from "next";
import { getPublishedArticles } from "@/lib/data";
import frMessages from "@/i18n/fr/common.json";
import arMessages from "@/i18n/ar/common.json";
import { formatMetaTitle, formatMetaDescription, getSiteUrl } from "@/lib/seo";
import ReportCard from "@/components/reports/ReportCard";

type Params = Promise<{ locale: string }>;

export default async function ReportsPage({ params }: { params: Params }) {
  const { locale } = await params;
  const messages = locale === "ar" ? arMessages : frMessages;
  const dir = locale === "ar" ? "rtl" : "ltr";

  const reports = await getPublishedArticles({ category: "rapports" });

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
          {messages.reports || (locale === "ar" ? "تقارير" : "Rapports")}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-slate-400">
          {messages.reports_description || (locale === "ar"
            ? "تصفح أحدث التقارير والدراسات"
            : "Consultez nos derniers rapports et études")}
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center dark:border-slate-700">
          <p className="text-gray-500 dark:text-slate-400">
            {messages.no_reports || (locale === "ar" ? "لا توجد تقارير بعد" : "Aucun rapport pour le moment.")}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const messages = locale === "ar" ? arMessages : frMessages;
  const baseUrl = getSiteUrl();
  const title = messages.reports || (locale === "ar" ? "تقارير" : "Rapports");
  const description = locale === "ar"
    ? "تصفح أحدث التقارير والدراسات من إيكوتير"
    : "Consultez nos derniers rapports et études sur Ecoterre";

  return {
    title: formatMetaTitle(title, messages.site_name),
    description: formatMetaDescription(description),
    openGraph: {
      title: `${title} | ${messages.site_name}`,
      description,
      url: `${baseUrl}/${locale}/reports`,
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
      canonical: `${baseUrl}/${locale}/reports`,
      languages: {
        fr: `${baseUrl}/fr/reports`,
        ar: `${baseUrl}/ar/reports`,
      },
    },
    robots: { index: true, follow: true },
  };
}
