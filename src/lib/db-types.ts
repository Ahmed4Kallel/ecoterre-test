export interface UserRow {
  id: string;
  email: string;
  password: string;
  name: string;
  role: "admin" | "author";
  avatar: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryRow {
  id: string;
  slug: string;
  name_fr: string;
  name_ar: string;
  description_fr: string;
  description_ar: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface ArticleRow {
  id: string;
  slug: string;
  title_fr: string;
  title_ar: string;
  content_fr: string;
  content_ar: string;
  excerpt_fr: string;
  excerpt_ar: string;
  cover_image: string | null;
  audio_url: string | null;
  pdf_url: string | null;
  author_id: string;
  status: "draft" | "published";
  views: number;
  reading_time: number;
  is_featured: number;
  published_at: string | null;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TagRow {
  id: string;
  slug: string;
  name_fr: string;
  name_ar: string;
  created_at: string;
}

export interface ArticleTagRow {
  article_id: string;
  tag_id: string;
}

export interface ArticleCategoryRow {
  article_id: string;
  category_id: string;
}

export interface CommentRow {
  id: string;
  article_id: string;
  author_name: string;
  author_email: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface NewsletterRow {
  id: string;
  email: string;
  subscribed: number;
  created_at: string;
}

export interface ContactRow {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: number;
  created_at: string;
}

export interface MediaRow {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
  alt_text: string;
  uploaded_by: string | null;
  created_at: string;
}

export interface SettingRow {
  key: string;
  value: string;
  updated_at: string;
}

export interface TranslationCacheRow {
  id: string;
  article_id: string;
  target_lang: string;
  content: string;
  title: string;
  excerpt: string;
  created_at: string;
}

export interface PodcastRow {
  id: string;
  slug: string;
  title_fr: string;
  title_ar: string;
  description_fr: string;
  description_ar: string;
  audio_url: string | null;
  cover_image: string | null;
  author_id: string | null;
  status: string;
  duration: number;
  created_at: string;
  updated_at: string;
}

export interface ReportRow {
  id: string;
  slug: string;
  title_fr: string;
  title_ar: string;
  content_fr: string;
  content_ar: string;
  excerpt_fr: string;
  excerpt_ar: string;
  cover_image: string | null;
  pdf_url: string | null;
  author_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ViewsLogRow {
  id: string;
  article_id: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}
