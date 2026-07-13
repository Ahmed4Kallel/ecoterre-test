import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getArticleBySlug, getCategories, getRelatedArticles } from "@/lib/data";
import frMessages from "@/i18n/fr/common.json";
import arMessages from "@/i18n/ar/common.json";
import { formatMetaTitle, formatMetaDescription, getSiteUrl, generateArticleSchema, generateBreadcrumbSchema } from "@/lib/seo";
import ShareButtons from "@/components/articles/ShareButtons";
import TableOfContents from "@/components/articles/TableOfContents";
import YouTubeEmbed from "@/components/articles/YouTubeEmbed";
import PodcastPlayer from "@/components/podcasts/PodcastPlayer";
import ScrollProgress from "@/components/ui/ScrollProgress";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ReadingTime from "@/components/ui/ReadingTime";
import CopyButton from "@/components/ui/CopyButton";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { sanitizeHtml } from "@/lib/security";

type Params = Promise<{ locale: string; slug: string }>;

export default async function ArticlePage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const lang = locale as "fr" | "ar";
  const messages = locale === "ar" ? arMessages : frMessages;
  const dir = locale === "ar" ? "rtl" : "ltr";

  const article = await getArticleBySlug(slug);
  if (!article || article.status !== "published") notFound();

  const categories = await getCategories();
  const articleCategories = categories.filter((c) =>
    article.categoryIds.includes(c.id)
  );

  const relatedArticles = await getRelatedArticles(
    article.id,
    article.categoryIds,
    3
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString(
      locale === "ar" ? "ar-TN" : "fr-TN",
      { year: "numeric", month: "long", day: "numeric" }
    );
  };

  const backArrowPath =
    dir === "rtl" ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7";

  const articleContent = sanitizeHtml(article.content[lang] || "");
  const plainText = articleContent.replace(/<[^>]*>/g, "");

  let headingIndex = 0;
  const contentWithIds = articleContent.replace(
    /<h2([^>]*)>(.*?)<\/h2>/gi,
    (_, attrs: string, text: string) => {
      const cleanText = text.replace(/<[^>]*>/g, "").trim();
      const id = `toc-${cleanText
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF\s]/g, "")
        .replace(/\s+/g, "-")}-${headingIndex++}`;
      return `<h2${attrs} id="${id}">${text}</h2>`;
    }
  );

  const headings: { id: string; text: string }[] = [];
  let match;
  const h2Regex = /<h2[^>]*id="([^"]*)"[^>]*>(.*?)<\/h2>/gi;
  while ((match = h2Regex.exec(contentWithIds)) !== null) {
    headings.push({ id: match[1], text: match[2].replace(/<[^>]*>/g, "") });
  }

  const hasPodcast = article.audioUrl || articleCategories.some((c) => c.slug === "podcast");

  const articleSchema = generateArticleSchema(article, lang, categories);
  const breadcrumbItemsSchema = [
    { name: messages.breadcrumb_home || messages.home, url: `/${locale}` },
  ];
  if (articleCategories.length > 0) {
    breadcrumbItemsSchema.push({
      name: articleCategories[0].name[lang],
      url: `/${locale}/category/${articleCategories[0].slug}`,
    });
  }
  breadcrumbItemsSchema.push({ name: article.title[lang], url: `/${locale}/article/${slug}` });
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItemsSchema);

  const articleUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ""}/${locale}/article/${slug}`;

  const breadcrumbItems: { label: string; href?: string }[] = [
    { label: messages.breadcrumb_home || messages.home, href: `/${locale}` },
  ];
  if (articleCategories.length > 0) {
    breadcrumbItems.push({
      label: articleCategories[0].name[lang],
      href: `/${locale}/category/${articleCategories[0].slug}`,
    });
  }
  breadcrumbItems.push({ label: article.title[lang] });

  return (
    <>
      <ScrollProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="min-w-0 flex-1">
            <Link
              href={`/${locale}`}
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-green-800 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={backArrowPath} />
              </svg>
              {messages.back}
            </Link>

            <div className="mb-4 flex flex-wrap gap-2">
              {articleCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/${locale}/category/${cat.slug}`}
                  className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/60 transition-colors"
                >
                  {cat.name[lang]}
                </Link>
              ))}
            </div>

            <h1 className="mb-4 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl dark:text-slate-100">
              {article.title[lang]}
            </h1>

            <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-slate-400">
              {article.authorName && (
                <span>
                  {messages.by}{" "}
                  <strong className="text-gray-700 dark:text-slate-300">
                    {article.authorName}
                  </strong>
                </span>
              )}
              <span>
                {messages.published_at} {formatDate(article.publishedAt)}
              </span>
              <ReadingTime text={plainText} locale={locale} />
            </div>

            {article.coverImage && (
              <div className="mb-8 max-h-[480px] w-full">
                <OptimizedImage
                  src={article.coverImage}
                  alt={article.title[lang]}
                  width={800}
                  height={400}
                  priority
                  className="w-full rounded-lg object-cover"
                />
              </div>
            )}

            {hasPodcast && article.audioUrl && (
              <div className="mb-8">
                <PodcastPlayer
                  audioUrl={article.audioUrl}
                  title={article.title[lang]}
                  coverImage={article.coverImage}
                />
              </div>
            )}

            <div
              className="rich-text-content mb-8 leading-relaxed text-gray-800 dark:text-slate-200"
              dangerouslySetInnerHTML={{ __html: contentWithIds }}
            />

            <hr className="my-8 border-gray-200 dark:border-slate-700" />

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <ShareButtons url={articleUrl} title={article.title[lang]} />
                <CopyButton text={articleUrl} label={messages.share_copy || ""} />
              </div>

              <Link
                href={`/${locale === "fr" ? "ar" : "fr"}/article/${slug}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                {messages.translate_article}
              </Link>
            </div>

            {relatedArticles.length > 0 && (
              <section className="mt-12">
                <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-slate-100">
                  {locale === "ar" ? "مقالات ذات صلة" : "Articles liés"}
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedArticles.map((related) => (
                    <Link
                      key={related.id}
                      href={`/${locale}/article/${related.slug}`}
                      className="group rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      {related.coverImage && (
                        <OptimizedImage
                          src={related.coverImage}
                          alt={related.title[lang]}
                          width={300}
                          height={160}
                          className="mb-3 h-40 w-full rounded-md object-cover"
                        />
                      )}
                      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-green-800 dark:text-slate-100 dark:group-hover:text-green-400 transition-colors line-clamp-2">
                        {related.title[lang]}
                      </h3>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {headings.length > 0 && (
            <TableOfContents headings={headings} />
          )}
        </div>
      </div>
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const lang = locale as "fr" | "ar";
  const article = await getArticleBySlug(slug);
  const baseUrl = getSiteUrl();
  const messages = locale === "ar" ? arMessages : frMessages;

  if (!article) {
    return {
      title: locale === "ar" ? "المقال غير موجود" : "Article introuvable",
    };
  }

  return {
    title: formatMetaTitle(article.title[lang], messages.site_name),
    description: formatMetaDescription(article.excerpt[lang]),
    openGraph: {
      title: article.title[lang],
      description: article.excerpt[lang],
      url: `${baseUrl}/${locale}/article/${slug}`,
      siteName: messages.site_name,
      locale: locale === "ar" ? "ar_TN" : "fr_TN",
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: article.authorName ? [article.authorName] : undefined,
      ...(article.coverImage && { images: [`${baseUrl}${article.coverImage}`] }),
    },
    twitter: {
      card: "summary_large_image",
      title: article.title[lang],
      description: article.excerpt[lang],
      ...(article.coverImage && { images: [`${baseUrl}${article.coverImage}`] }),
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/article/${slug}`,
      languages: {
        fr: `${baseUrl}/fr/article/${slug}`,
        ar: `${baseUrl}/ar/article/${slug}`,
      },
    },
    robots: { index: true, follow: true },
  };
}
