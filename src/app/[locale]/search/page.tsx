import Link from "next/link";
import type { Metadata } from "next";
import { searchArticles } from "@/lib/data";
import frMessages from "@/i18n/fr/common.json";
import arMessages from "@/i18n/ar/common.json";
import SearchBar from "@/components/layout/SearchBar";
import OptimizedImage from "@/components/ui/OptimizedImage";

type Params = Promise<{ locale: string }>;
type SearchParams = Promise<{ q?: string }>;

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { locale } = await params;
  const lang = locale as "fr" | "ar";
  const { q } = await searchParams;
  const messages = locale === "ar" ? arMessages : frMessages;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const backArrowPath =
    dir === "rtl" ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7";

  const query = q?.trim() || "";
  const results = query ? await searchArticles(query, locale) : [];

  const resultLabel = messages.results_for || (locale === "ar" ? "نتائج لـ" : "résultats pour");

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
        <SearchBar placeholder={messages.search_placeholder} />
      </div>

      {!query ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center dark:border-slate-700">
          <p className="text-gray-500 dark:text-slate-400">{messages.search_placeholder}</p>
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center dark:border-slate-700">
          <p className="text-gray-500 dark:text-slate-400">{messages.no_results}</p>
        </div>
      ) : (
        <>
          <p className="mb-6 text-sm text-gray-500 dark:text-slate-400">
            {results.length} {resultLabel} &quot;{q}&quot;
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((article) => (
              <Link
                key={article.id}
                href={`/${locale}/article/${article.slug}`}
                className="group rounded-lg border border-gray-200 overflow-hidden transition-shadow hover:shadow-md dark:border-slate-700 dark:hover:bg-slate-800"
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
                  <h3 className="mb-2 text-sm font-semibold text-gray-900 group-hover:text-green-800 transition-colors line-clamp-2 dark:text-slate-100 dark:group-hover:text-green-400">
                    {article.title[lang]}
                  </h3>
                  <p className="mb-3 text-xs text-gray-500 line-clamp-2 dark:text-slate-400">
                    {article.excerpt[lang]}
                  </p>
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">
                    {article.authorName}
                  </span>
                </div>
              </Link>
            ))}
          </div>
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
  const { locale } = await params;
  const messages = locale === "ar" ? arMessages : frMessages;
  return {
    title: messages.search,
    description: messages.search_placeholder,
    robots: { index: false, follow: false },
  };
}
