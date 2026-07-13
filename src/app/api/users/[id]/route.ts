import { NextRequest, NextResponse } from "next/server";
import { findById, remove } from "@/lib/db";
import { getSession, requireAdmin } from "@/lib/auth";
import type { User } from "@/lib/types";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getSession();
    if (!requireAdmin(currentUser)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (currentUser!.id === id) {
      return NextResponse.json(
        { error: "Cannot delete yourself" },
        { status: 400 }
      );
    }

    const target = findById<User>("users", id);
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    remove("users", id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
