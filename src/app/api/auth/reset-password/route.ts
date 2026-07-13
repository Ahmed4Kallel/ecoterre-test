import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/database";
import { hashPassword } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

interface ResetTokenRow {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  used: number;
}

export async function POST(request: NextRequest) {
  try {
    const { blocked, response, headers } = checkRateLimit(request, {
      limit: 5,
      windowMs: 60_000,
    });
    if (blocked && response) return response;

    const { token, password } = await request.json();

    if (!token || !password || typeof token !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Token and password are required." },
        { status: 400, headers }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400, headers }
      );
    }

    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least 1 letter and 1 number." },
        { status: 400, headers }
      );
    }

    const db = getDb();

    const tokenRow = db
      .prepare("SELECT * FROM password_reset_tokens WHERE token = ?")
      .get(token) as ResetTokenRow | undefined;

    if (!tokenRow) {
      return NextResponse.json(
        { error: "Invalid or expired reset token." },
        { status: 400, headers }
      );
    }

    if (tokenRow.used === 1) {
      return NextResponse.json(
        { error: "Invalid or expired reset token." },
        { status: 400, headers }
      );
    }

    const now = new Date().toISOString();
    if (tokenRow.expires_at < now) {
      return NextResponse.json(
        { error: "Invalid or expired reset token." },
        { status: 400, headers }
      );
    }

    const hashed = hashPassword(password);

    db.prepare("UPDATE users SET password = ?, updated_at = ? WHERE id = ?").run(
      hashed,
      now,
      tokenRow.user_id
    );

    db.prepare("UPDATE password_reset_tokens SET used = 1 WHERE id = ?").run(tokenRow.id);

    return NextResponse.json({ success: true }, { headers });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
