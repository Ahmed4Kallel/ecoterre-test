import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { Article, Category } from "@/lib/types";
import { getArticleBySlug, getCategories } from "@/lib/data";
import frMessages from "@/i18n/fr/common.json";
import arMessages from "@/i18n/ar/common.json";
import { formatMetaTitle, formatMetaDescription, getSiteUrl } from "@/lib/seo";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ReadingTime from "@/components/ui/ReadingTime";
import { sanitizeHtml } from "@/lib/security";

type Params = Promise<{ locale: string; slug: string }>;

export default async function ReportPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const lang = locale as "fr" | "ar";
  const messages = locale === "ar" ? arMessages : frMessages;
  const dir = locale === "ar" ? "rtl" : "ltr";

  const report = await getArticleBySlug(slug);

  if (!report || report.status !== "published") notFound();

  const categories = await getCategories();

  const reportsCat = categories.find((c) => c.slug === "reports");
  const isReport = reportsCat && report.categoryIds.includes(reportsCat.id);

  if (!isReport) notFound();

  const reportContent = sanitizeHtml(report.content[lang] || "");
  const plainText = reportContent.replace(/<[^>]*>/g, "");

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString(
      locale === "ar" ? "ar-TN" : "fr-TN",
      { year: "numeric", month: "long", day: "numeric" }
    );
  };

  const backArrowPath =
    dir === "rtl" ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7";

  const breadcrumbItems: { label: string; href?: string }[] = [
    { label: messages.breadcrumb_home || messages.home, href: `/${locale}` },
    { label: messages.reports || (locale === "ar" ? "تقارير" : "Rapports"), href: `/${locale}/reports` },
    { label: report.title[lang] },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} />

      {/* Back link */}
      <Link
        href={`/${locale}/reports`}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-green-800 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={backArrowPath} />
        </svg>
        {messages.back}
      </Link>

      {/* Title */}
      <h1 className="mb-4 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl dark:text-slate-100">
        {report.title[lang]}
      </h1>

      {/* Meta row */}
      <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-slate-400">
        {report.authorName && (
          <span>
            {messages.by}{" "}
            <strong className="text-gray-700 dark:text-slate-300">
              {report.authorName}
            </strong>
          </span>
        )}
        <span>
          {messages.published_at} {formatDate(report.publishedAt)}
        </span>
        <ReadingTime text={plainText} locale={locale} />
      </div>

      {/* Cover image */}
      {report.coverImage && (
        <img
          src={report.coverImage}
          alt={report.title[lang]}
          className="mb-8 w-full rounded-lg object-cover"
          style={{ maxHeight: "480px" }}
          fetchPriority="high"
        />
      )}

      {/* PDF download button */}
      {report.pdfUrl && (
        <div className="mb-8">
          <a
            href={report.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border-2 border-green-700 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-900/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            {messages.download_pdf || (locale === "ar" ? "تحميل PDF" : "Télécharger le PDF")}
          </a>
        </div>
      )}

      {/* Report content */}
      <div
        className="rich-text-content mb-8 leading-relaxed text-gray-800 dark:text-slate-200"
        dangerouslySetInnerHTML={{ __html: reportContent }}
      />

      {/* Download count */}
      {report.downloadCount !== undefined && report.downloadCount > 0 && (
        <p className="text-sm text-gray-500 dark:text-slate-400">
          {locale === "ar"
            ? `${report.downloadCount} تحميل`
            : `${report.downloadCount} téléchargement${report.downloadCount > 1 ? "s" : ""}`}
        </p>
      )}
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const lang = locale as "fr" | "ar";
  const report = await getArticleBySlug(slug);
  const baseUrl = getSiteUrl();
  const messages = locale === "ar" ? arMessages : frMessages;

  if (!report) {
    return {
      title: messages.article_not_found || (locale === "ar" ? "المقال غير موجود" : "Article introuvable"),
    };
  }

  return {
    title: formatMetaTitle(report.title[lang], messages.site_name),
    description: formatMetaDescription(report.excerpt[lang]),
    openGraph: {
      title: report.title[lang],
      description: report.excerpt[lang],
      url: `${baseUrl}/${locale}/reports/${slug}`,
      siteName: messages.site_name,
      locale: locale === "ar" ? "ar_TN" : "fr_TN",
      type: "article",
      publishedTime: report.publishedAt,
      modifiedTime: report.updatedAt,
      authors: report.authorName ? [report.authorName] : undefined,
      ...(report.coverImage && { images: [`${baseUrl}${report.coverImage}`] }),
    },
    twitter: {
      card: "summary_large_image",
      title: report.title[lang],
      description: report.excerpt[lang],
      ...(report.coverImage && { images: [`${baseUrl}${report.coverImage}`] }),
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/reports/${slug}`,
      languages: {
        fr: `${baseUrl}/fr/reports/${slug}`,
        ar: `${baseUrl}/ar/reports/${slug}`,
      },
    },
    robots: { index: true, follow: true },
  };
}
