import { NextRequest, NextResponse } from "next/server";
import { findBy } from "@/lib/db";
import { verifyPassword, setSession } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import type { User } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { blocked, response, headers } = checkRateLimit(request, { limit: 5, windowMs: 60_000 });
    if (blocked && response) return response;

    const { email, password, rememberMe } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 400, headers }
      );
    }

    const user = findBy("users", "email", email) as User | undefined;
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401, headers }
      );
    }

    if (!verifyPassword(password, user.password)) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401, headers }
      );
    }

    await setSession(user, rememberMe ?? false);

    const { password: _, ...safeUser } = user;
    return NextResponse.json({ user: safeUser }, { headers });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
