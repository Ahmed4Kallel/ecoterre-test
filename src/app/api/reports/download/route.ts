import { NextRequest, NextResponse } from "next/server";
import { findAll, update } from "@/lib/db";
import type { Article } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { articleId } = await request.json();

    if (!articleId) {
      return NextResponse.json({ error: "Article ID is required" }, { status: 400 });
    }

    const articles = findAll<Article>("articles");
    const article = articles.find((a) => a.id === articleId);

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const currentCount = article.downloadCount || 0;
    update("articles", articleId, {
      downloadCount: currentCount + 1,
      updatedAt: new Date().toISOString(),
    });

    const pdfUrl = article.content?.fr
      ? extractPdfUrl(article.content.fr)
      : null;

    return NextResponse.json({
      success: true,
      downloadCount: currentCount + 1,
      pdfUrl,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process download" },
      { status: 500 }
    );
  }
}

function extractPdfUrl(content: string): string | null {
  const match = content.match(/https?:\/\/[^\s"']+\.pdf/i);
  return match ? match[0] : null;
}
