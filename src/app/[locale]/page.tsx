import type { Metadata } from "next";
import { getPublishedArticles, getCategories, getTags } from "@/lib/data";
import frMessages from "@/i18n/fr/common.json";
import arMessages from "@/i18n/ar/common.json";
import { formatMetaTitle, formatMetaDescription, getSiteUrl } from "@/lib/seo";
import PageTransition from "@/components/ui/PageTransition";
import BreakingNewsTicker from "@/components/home/BreakingNewsTicker";
import HeroSection from "@/components/home/HeroSection";
import FeaturedGrid from "@/components/home/FeaturedGrid";
import CategorySection from "@/components/home/CategorySection";
import LatestNews from "@/components/home/LatestNews";
import PodcastsPreview from "@/components/home/PodcastsPreview";
import ReportsPreview from "@/components/home/ReportsPreview";
import NewsletterBanner from "@/components/home/NewsletterBanner";
import Sidebar from "@/components/home/Sidebar";

type Params = Promise<{ locale: string }>;

const PODCAST_SLUG = "podcast";
const REPORTS_SLUG = "rapports";

export default async function HomePage({ params }: { params: Params }) {
  const { locale } = await params;

  const categories = await getCategories();
  const publishedArticles = await getPublishedArticles({ limit: 50 });
  const tags = await getTags();

  const heroArticle = publishedArticles[0] || null;

  const featuredArticles = publishedArticles
    .filter((a) => a.isFeatured)
    .slice(0, 4);

  const popularArticles = [...publishedArticles]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  const podcastCat = categories.find((c) => c.slug === PODCAST_SLUG);
  const reportsCat = categories.find((c) => c.slug === REPORTS_SLUG);

  const podcastArticles = podcastCat
    ? publishedArticles.filter((a) => a.categoryIds.includes(podcastCat.id)).slice(0, 4)
    : [];

  const reportArticles = reportsCat
    ? publishedArticles.filter((a) => a.categoryIds.includes(reportsCat.id)).slice(0, 3)
    : [];

  const categoriesToShow = categories.filter(
    (c) => c.slug !== PODCAST_SLUG && c.slug !== REPORTS_SLUG
  );

  const shownIds = new Set<string>();
  if (heroArticle) shownIds.add(heroArticle.id);

  const featuredGridArticles =
    featuredArticles.length >= 4
      ? featuredArticles.slice(0, 4)
      : publishedArticles.filter((a) => !shownIds.has(a.id)).slice(0, 4);

  featuredGridArticles.forEach((a) => shownIds.add(a.id));

  const latestArticles = publishedArticles
    .filter((a) => !shownIds.has(a.id))
    .slice(0, 9);

  return (
    <>
      <BreakingNewsTicker articles={publishedArticles.slice(0, 5)} locale={locale} />

      {heroArticle && <HeroSection article={heroArticle} locale={locale} />}

      <PageTransition>
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex gap-8">
            <div className="flex-1 space-y-16 py-12 min-w-0">
              <FeaturedGrid articles={featuredGridArticles} locale={locale} />

              {categoriesToShow.map((cat) => {
                const catArticles = publishedArticles
                  .filter((a) => !shownIds.has(a.id) && a.categoryIds.includes(cat.id))
                  .slice(0, 4);
                if (catArticles.length === 0) return null;
                catArticles.forEach((a) => shownIds.add(a.id));
                return (
                  <CategorySection
                    key={cat.id}
                    category={cat}
                    articles={catArticles}
                    locale={locale}
                  />
                );
              })}

              <LatestNews articles={latestArticles} locale={locale} />

              {podcastArticles.length > 0 && (
                <PodcastsPreview podcasts={podcastArticles} locale={locale} />
              )}

              {reportArticles.length > 0 && (
                <ReportsPreview reports={reportArticles} locale={locale} />
              )}

              <NewsletterBanner />
            </div>

            <aside className="hidden w-80 shrink-0 lg:block">
              <div className="sticky top-4 space-y-8 py-12">
                <Sidebar popularArticles={popularArticles} tags={tags} locale={locale} />
              </div>
            </aside>
          </div>
        </div>
      </PageTransition>
    </>
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

  const articles = await getPublishedArticles({ limit: 1 });
  const heroArticle = articles[0] || null;

  return {
    title: messages.site_name,
    description: messages.site_description,
    openGraph: {
      title: messages.site_name,
      description: messages.site_description,
      url: `${baseUrl}/${locale}`,
      siteName: messages.site_name,
      locale: locale === "ar" ? "ar_TN" : "fr_TN",
      type: "website",
      ...(heroArticle?.coverImage && {
        images: [`${baseUrl}${heroArticle.coverImage}`],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: messages.site_name,
      description: messages.site_description,
      ...(heroArticle?.coverImage && {
        images: [`${baseUrl}${heroArticle.coverImage}`],
      }),
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
