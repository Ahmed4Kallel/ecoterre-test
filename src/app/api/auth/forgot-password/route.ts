import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database";
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

    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (user) {
      const token = crypto.randomUUID();
      const id = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      await supabase.from("password_reset_tokens").insert({
        id,
        user_id: user.id,
        token,
        expires_at: expiresAt,
        used: 0,
      });
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
