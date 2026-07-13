import { NextRequest, NextResponse } from "next/server";
import { getSession, setSession, hashPassword, verifyPassword } from "@/lib/auth";
import { supabase } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (!verifyPassword(currentPassword, user.password)) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const hashed = hashPassword(newPassword);
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("users")
      .update({ password: hashed, updated_at: now })
      .eq("id", user.id);
    if (error) throw error;

    const updatedUser = { ...user, password: hashed };
    await setSession(updatedUser);

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
