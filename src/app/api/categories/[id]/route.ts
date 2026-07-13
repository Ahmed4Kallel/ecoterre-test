import { NextRequest, NextResponse } from "next/server";
import { findAll, findById, update, remove } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { getSession, requireAdmin } from "@/lib/auth";
import type { Category } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = findById<Category>("categories", id);
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ category });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession();
    if (!requireAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const category = findById<Category>("categories", id);
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    if (body.slug && body.slug !== category.slug) {
      const allCategories = findAll<Category>("categories");
      const duplicate = allCategories.find(
        (c) => c.id !== id && c.slug === body.slug
      );
      if (duplicate) {
        return NextResponse.json(
          { error: "A category with this slug already exists" },
          { status: 409 }
        );
      }
    }

    const updates: Record<string, unknown> = {
      slug:
        body.slug ||
        (body.name?.fr ? slugify(body.name.fr) : category.slug),
    };

    if (body.name) updates.name = body.name;
    if (body.description) updates.description = body.description;
    if (body.icon !== undefined) updates.icon = body.icon;
    if (body.order !== undefined) updates.order = body.order;

    const updated = update("categories", id, updates);
    return NextResponse.json({ category: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession();
    if (!requireAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const deleted = remove("categories", id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
