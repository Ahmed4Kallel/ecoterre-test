import { NextRequest, NextResponse } from "next/server";
import { getSession, setSession, hashPassword, verifyPassword } from "@/lib/auth";
import { getDb, isVercel } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isVercel()) {
      return NextResponse.json(
        { error: "Le changement de mot de passe n'est pas disponible en démo. Contactez l'administrateur." },
        { status: 400 }
      );
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

    const db = getDb();
    db.prepare("UPDATE users SET password = ?, updated_at = ? WHERE id = ?").run(
      hashed,
      now,
      user.id
    );

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
