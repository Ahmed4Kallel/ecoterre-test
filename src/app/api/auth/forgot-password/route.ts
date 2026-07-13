import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/database";
import { checkRateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { blocked, response, headers } = checkRateLimit(request, {
      limit: 3,
      windowMs: 60_000,
    });
    if (blocked && response) return response;

    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: true, message: "If this email exists, a reset link has been sent." },
        { headers }
      );
    }

    const db = getDb();
    const user = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email) as { id: string } | undefined;

    if (user) {
      const token = crypto.randomUUID();
      const id = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      db.prepare(
        `INSERT INTO password_reset_tokens (id, user_id, token, expires_at, used) VALUES (?, ?, ?, ?, 0)`
      ).run(id, user.id, token, expiresAt);

    }

    return NextResponse.json(
      { success: true, message: "If this email exists, a reset link has been sent." },
      { headers }
    );
  } catch (e) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
