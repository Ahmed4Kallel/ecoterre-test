import { NextRequest, NextResponse } from "next/server";
import { getComments, createComment } from "@/lib/db";
import { isValidEmail, sanitizeText, sanitizeHtmlInput } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get("article_id") || undefined;
    const status = searchParams.get("status") || "approved";

    const comments = await getComments(articleId, status);
    return NextResponse.json({ comments });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { blocked, response, headers } = checkRateLimit(request, { limit: 10, windowMs: 60_000 });
    if (blocked && response) return response;

    const body = await request.json();

    if (!body.article_id || !body.author_name || !body.content) {
      return NextResponse.json(
        { error: "article_id, author_name, and content are required" },
        { status: 400, headers }
      );
    }

    if (body.author_email && !isValidEmail(body.author_email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400, headers }
      );
    }

    if (typeof body.author_name !== "string" || body.author_name.length > 100) {
      return NextResponse.json(
        { error: "Author name must be 100 characters or less" },
        { status: 400, headers }
      );
    }

    if (typeof body.content !== "string" || body.content.length > 5000) {
      return NextResponse.json(
        { error: "Comment must be 5000 characters or less" },
        { status: 400, headers }
      );
    }

    const comment = await createComment({
      article_id: body.article_id,
      author_name: sanitizeText(body.author_name),
      author_email: body.author_email ? body.author_email.trim().toLowerCase() : "",
      content: sanitizeHtmlInput(body.content),
    });

    return NextResponse.json({ comment }, { status: 201, headers });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
