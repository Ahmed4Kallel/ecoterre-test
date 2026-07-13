import type { MetadataRoute } from "next";
import type { Article, Category, Tag } from "@/lib/types";
import { getDb } from "@/lib/database";
import articlesData from "@/data/articles.json";
import categoriesData from "@/data/categories.json";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ecoterre.tn";

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = articlesData as Article[];
  const categories = categoriesData as Category[];
  const published = articles.filter((a) => a.status === "published");

  const entries: MetadataRoute.Sitemap = [];

  const locales = ["fr", "ar"] as const;

  for (const locale of locales) {
    entries.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
      alternates: {
        languages: {
          fr: `${BASE_URL}/fr`,
          ar: `${BASE_URL}/ar`,
        },
      },
    });
  }

  const staticPages = [
    { path: "search", freq: "weekly" as const, priority: 0.3 },
    { path: "contact", freq: "monthly" as const, priority: 0.5 },
    { path: "podcasts", freq: "daily" as const, priority: 0.7 },
    { path: "reports", freq: "weekly" as const, priority: 0.8 },
  ];

  for (const page of staticPages) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.freq,
        priority: page.priority,
        alternates: {
          languages: {
            fr: `${BASE_URL}/fr/${page.path}`,
            ar: `${BASE_URL}/ar/${page.path}`,
          },
        },
      });
    }
  }

  for (const category of categories) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/category/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.8,
        alternates: {
          languages: {
            fr: `${BASE_URL}/fr/category/${category.slug}`,
            ar: `${BASE_URL}/ar/category/${category.slug}`,
          },
        },
      });
    }
  }

  const db = getDb();
  const tags = db.prepare("SELECT * FROM tags").all() as Tag[];

  for (const tag of tags) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/tag/${tag.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      });
    }
  }

  for (const article of published) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/article/${article.slug}`,
        lastModified: new Date(article.updatedAt || article.publishedAt || article.createdAt),
        changeFrequency: "weekly",
        priority: 0.9,
        alternates: {
          languages: {
            fr: `${BASE_URL}/fr/article/${article.slug}`,
            ar: `${BASE_URL}/ar/article/${article.slug}`,
          },
        },
      });
    }
  }

  return entries;
}
