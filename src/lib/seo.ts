import "server-only";
import type { Article, Category } from "./types";

export function formatMetaTitle(title: string, siteName?: string): string {
  const name = siteName || "Ecoterre";
  return title ? `${title} | ${name}` : name;
}

export function formatMetaDescription(excerpt: string, maxLength = 160): string {
  if (!excerpt) return "";
  const cleaned = excerpt.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength).replace(/\s+\S*$/, "") + "...";
}

export function generateOrganizationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Ecoterre",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://ecoterre.tn",
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://ecoterre.tn"}/logo.png`,
    description:
      "Portail d'actualités spécialisé dans l'environnement et l'économie en Tunisie",
    sameAs: [
      "https://www.facebook.com/Ecoterre",
      "https://x.com/Ecoterre",
      "https://www.linkedin.com/company/ecoterre",
      "https://www.youtube.com/@Ecoterre",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "contact@ecoterre.tn",
    },
  };
}

export function generateWebsiteSchema(): Record<string, unknown> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ecoterre.tn";
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Ecoterre",
    url: baseUrl,
    description:
      "Portail d'actualités spécialisé dans l'environnement et l'économie en Tunisie",
    inLanguage: ["fr", "ar"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/fr/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
): Record<string, unknown> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ecoterre.tn";
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
}

export function generateArticleSchema(
  article: Article,
  locale: "fr" | "ar",
  categories: Category[]
): Record<string, unknown> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ecoterre.tn";
  const lang = locale;
  const articleCategories = categories.filter((c) =>
    article.categoryIds.includes(c.id)
  );

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title[lang],
    description: article.excerpt[lang],
    image: article.coverImage
      ? `${baseUrl}${article.coverImage}`
      : undefined,
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Person",
      name: article.authorName || "Ecoterre",
    },
    publisher: {
      "@type": "Organization",
      name: "Ecoterre",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/${lang}/article/${article.slug}`,
    },
    ...(articleCategories.length > 0 && {
      articleSection: articleCategories.map((c) => c.name[lang]),
    }),
    inLanguage: lang === "ar" ? "ar-TN" : "fr-TN",
  };
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://ecoterre.tn";
}
