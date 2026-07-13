import { NextRequest, NextResponse } from "next/server";
import { findAll, insert } from "@/lib/db";
import { generateId, slugify } from "@/lib/utils";
import { getSession, requireAdmin } from "@/lib/auth";
import { isVercel } from "@/lib/database";
import type { Category, Article } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const withCounts = searchParams.get("withCounts") === "true";

    const categories = findAll<Category>("categories");
    categories.sort((a, b) => a.order - b.order);

    if (withCounts) {
      const articles = findAll<Article>("articles");
      const result = categories.map((cat) => ({
        ...cat,
        articleCount: articles.filter(
          (a) => a.categoryIds.includes(cat.id) && a.status === "published"
        ).length,
      }));
      return NextResponse.json({ categories: result });
    }

    return NextResponse.json({ categories });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!requireAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isVercel()) {
      return NextResponse.json(
        { error: "La création de catégories n'est pas disponible en démo." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const slug = body.slug || slugify(body.name?.fr || "category");

    const allCategories = findAll<Category>("categories");
    const duplicate = allCategories.find((c) => c.slug === slug);
    if (duplicate) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 409 }
      );
    }

    const maxOrder = allCategories.reduce(
      (max, c) => Math.max(max, c.order),
      0
    );

    const category = {
      id: generateId(),
      slug,
      name: body.name || { fr: "", ar: "" },
      description: body.description || { fr: "", ar: "" },
      icon: body.icon || undefined,
      order: body.order ?? maxOrder + 1,
    };

    insert("categories", category);
    return NextResponse.json({ category }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
