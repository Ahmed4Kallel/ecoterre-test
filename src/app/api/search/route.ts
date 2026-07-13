import { NextRequest, NextResponse } from "next/server";
import { searchArticles } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const locale = searchParams.get("locale") || undefined;
    const status = searchParams.get("status") || "published";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = (page - 1) * limit;

    if (!q.trim()) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const articles = searchArticles(q, locale, {
      where: { status },
      limit,
      offset,
    });

    return NextResponse.json({
      articles,
      query: q,
      locale,
      page,
      limit,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to search articles" },
      { status: 500 }
    );
  }
}
