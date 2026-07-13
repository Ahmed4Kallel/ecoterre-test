export type UserRole = "admin" | "author";

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: Record<"fr" | "ar", string>;
  description: Record<"fr" | "ar", string>;
  icon?: string;
  order: number;
}

export type ArticleStatus = "draft" | "published";

export interface Article {
  id: string;
  slug: string;
  title: Record<"fr" | "ar", string>;
  content: Record<"fr" | "ar", string>;
  excerpt: Record<"fr" | "ar", string>;
  coverImage?: string;
  categoryIds: string[];
  tagIds?: string[];
  authorId: string;
  authorName?: string;
  status: ArticleStatus;
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  audioUrl?: string;
  videoUrl?: string;
  pdfUrl?: string;
  readingTime?: number;
  isFeatured?: boolean;
  views?: number;
  downloadCount?: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface Tag {
  id: string;
  slug: string;
  name: Record<"fr" | "ar", string>;
  createdAt: string;
}

export interface TranslationCache {
  articleId: string;
  targetLang: "fr" | "ar";
  content: string;
  title: string;
  excerpt: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  articleId: string;
  articleTitle?: string;
  author: string;
  email: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
  active: boolean;
}

export interface SiteSetting {
  key: string;
  value: string;
}

export interface MediaItem {
  name: string;
  url: string;
  size: number;
  createdAt: string;
}

export interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalCategories: number;
  totalUsers: number;
  totalViews: number;
  commentsPending: number;
  subscribersCount: number;
  topArticles: Article[];
  articlesByCategory: { categoryName: string; count: number }[];
}
