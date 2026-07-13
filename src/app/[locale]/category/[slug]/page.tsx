import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCategoryBySlug, getPublishedArticles } from "@/lib/data";
import frMessages from "@/i18n/fr/common.json";
import arMessages from "@/i18n/ar/common.json";
import { formatMetaTitle, formatMetaDescription, getSiteUrl } from "@/lib/seo";
import Pagination from "@/components/ui/Pagination";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import OptimizedImage from "@/components/ui/OptimizedImage";

export const revalidate = 60;

type Params = Promise<{ locale: string; slug: string }>;
type SearchParams = Promise<{ page?: string }>;

const ARTICLES_PER_PAGE = 12;

export default async function CategoryPage({
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

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const categoryArticles = await getPublishedArticles({ category: slug });
  const sortedArticles = [...categoryArticles].sort(
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

  const baseUrl = `/${locale}/category/${slug}`;
  const backArrowPath =
    dir === "rtl" ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7";

  const breadcrumbItems: { label: string; href?: string }[] = [
    { label: messages.breadcrumb_home || messages.home, href: `/${locale}` },
    { label: category.name[lang] },
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
          {category.name[lang]}
        </h1>
        {category.description[lang] && (
          <p className="mt-2 text-gray-600 dark:text-slate-400">
            {category.description[lang]}
          </p>
        )}
      </div>

      {sortedArticles.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center dark:border-slate-700">
          <p className="text-gray-500 dark:text-slate-400">
            {messages.no_articles}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pagedArticles.map((article) => (
              <Link
                key={article.id}
                href={`/${locale}/article/${article.slug}`}
                className="group overflow-hidden rounded-lg border border-gray-200 transition-shadow hover:shadow-md dark:border-slate-700 dark:hover:bg-slate-800"
              >
                {article.coverImage && (
                  <OptimizedImage
                    src={article.coverImage}
                    alt={article.title[lang]}
                    width={400}
                    height={192}
                    className="h-48 w-full object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="mb-2 text-sm font-semibold text-gray-900 group-hover:text-green-800 dark:text-slate-100 dark:group-hover:text-green-400 transition-colors line-clamp-2">
                    {article.title[lang]}
                  </h3>
                  <p className="mb-3 text-xs text-gray-500 dark:text-slate-400 line-clamp-2">
                    {article.excerpt[lang]}
                  </p>
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">
                    {article.authorName}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl={baseUrl}
              />
            </div>
          )}
        </>
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
  const category = await getCategoryBySlug(slug);
  const messages = locale === "ar" ? arMessages : frMessages;
  const baseUrl = getSiteUrl();

  if (!category) {
    return {
      title: messages.category_not_found || (locale === "ar" ? "التصنيف غير موجود" : "Catégorie introuvable"),
    };
  }

  return {
    title: formatMetaTitle(category.name[lang], messages.site_name),
    description: formatMetaDescription(category.description[lang]),
    openGraph: {
      title: `${category.name[lang]} | ${messages.site_name}`,
      description: category.description[lang],
      url: `${baseUrl}/${locale}/category/${slug}`,
      siteName: messages.site_name,
      locale: locale === "ar" ? "ar_TN" : "fr_TN",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${category.name[lang]} | ${messages.site_name}`,
      description: category.description[lang],
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/category/${slug}`,
      languages: {
        fr: `${baseUrl}/fr/category/${slug}`,
        ar: `${baseUrl}/ar/category/${slug}`,
      },
    },
    robots: { index: true, follow: true },
  };
}
