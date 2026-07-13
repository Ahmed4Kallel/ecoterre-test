import { NextRequest, NextResponse } from "next/server";
import { getTags, createTag } from "@/lib/db";
import { getSession, requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "name_fr";

    const tags = getTags({ orderBy: sort });
    return NextResponse.json({ tags });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch tags" },
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

    const body = await request.json();
    const nameFr = body.name?.fr || body.nameFr || "";
    const nameAr = body.name?.ar || body.nameAr || "";
    const slug = body.slug || slugify(nameFr);

    if (!nameFr || !nameAr) {
      return NextResponse.json(
        { error: "Tag name (fr and ar) is required" },
        { status: 400 }
      );
    }

    const tag = createTag({
      slug,
      name: { fr: nameFr, ar: nameAr },
    });

    return NextResponse.json({ tag }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    );
  }
}
