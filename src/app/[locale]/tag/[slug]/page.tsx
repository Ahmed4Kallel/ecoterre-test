import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getTagBySlug } from "@/lib/db";
import { getPublishedArticles } from "@/lib/data";
import frMessages from "@/i18n/fr/common.json";
import arMessages from "@/i18n/ar/common.json";
import { formatMetaTitle, formatMetaDescription, getSiteUrl } from "@/lib/seo";
import Pagination from "@/components/ui/Pagination";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ArticleGrid from "@/components/articles/ArticleGrid";

type Params = Promise<{ locale: string; slug: string }>;
type SearchParams = Promise<{ page?: string }>;

const ARTICLES_PER_PAGE = 12;

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { locale, slug } = await params;
  const lang = locale as "fr" | "ar";
  const { page } = await searchParams;
  const messages = locale === "ar" ? arMessages : frMessages;
  const dir = locale === "ar" ? "rtl" : "ltr";

  const tag = await getTagBySlug(slug);
  if (!tag) notFound();

  const tagName = lang === "fr" ? tag.name_fr : tag.name_ar;

  const allArticles = await getPublishedArticles({ tag: slug });
  const sortedArticles = [...allArticles].sort(
    (a, b) =>
      new Date(b.publishedAt || b.createdAt).getTime() -
      new Date(a.publishedAt || a.createdAt).getTime()
  );

  const currentPage = Math.max(1, parseInt(page || "1", 10));
  const totalPages = Math.ceil(sortedArticles.length / ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const pagedArticles = sortedArticles.slice(
    startIndex,
    startIndex + ARTICLES_PER_PAGE
  );

  const baseUrl = `/${locale}/tag/${slug}`;
  const backArrowPath =
    dir === "rtl" ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7";

  const breadcrumbItems: { label: string; href?: string }[] = [
    { label: messages.breadcrumb_home || messages.home, href: `/${locale}` },
    { label: tagName },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} />

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
          {tagName}
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
          {sortedArticles.length}{" "}
          {locale === "ar"
            ? sortedArticles.length === 1 ? "مقالة" : "مقالات"
            : sortedArticles.length === 1 ? "article" : "articles"}
        </p>
      </div>

      <ArticleGrid articles={pagedArticles} locale={locale} />

      {totalPages > 1 && (
        <div className="mt-10">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl={baseUrl}
          />
        </div>
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
  const tag = await getTagBySlug(slug);
  const messages = locale === "ar" ? arMessages : frMessages;
  const baseUrl = getSiteUrl();

  if (!tag) {
    return {
      title: locale === "ar" ? "الوسم غير موجود" : "Tag introuvable",
    };
  }

  const tagName = lang === "fr" ? tag.name_fr : tag.name_ar;
  const description =
    lang === "fr"
      ? `Articles tagués avec ${tagName}`
      : `المقالات الموسومة بـ ${tagName}`;

  return {
    title: formatMetaTitle(tagName, messages.site_name),
    description: formatMetaDescription(description),
    openGraph: {
      title: `${tagName} | ${messages.site_name}`,
      description,
      url: `${baseUrl}/${locale}/tag/${slug}`,
      siteName: messages.site_name,
      locale: locale === "ar" ? "ar_TN" : "fr_TN",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${tagName} | ${messages.site_name}`,
      description,
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/tag/${slug}`,
      languages: {
        fr: `${baseUrl}/fr/tag/${slug}`,
        ar: `${baseUrl}/ar/tag/${slug}`,
      },
    },
    robots: { index: true, follow: true },
  };
}
