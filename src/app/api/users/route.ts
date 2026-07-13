import { NextRequest, NextResponse } from "next/server";
import { findAll, findBy, insert } from "@/lib/db";
import { generateId } from "@/lib/utils";
import { getSession, requireAdmin, hashPassword } from "@/lib/auth";
import { isValidEmail, isValidPassword } from "@/lib/validation";
import type { User } from "@/lib/types";

export async function GET() {
  try {
    const user = await getSession();
    if (!requireAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = (await findAll<User>("users")).map((u) => {
      const { password: _, ...safe } = u;
      return safe;
    });

    return NextResponse.json({ users });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getSession();
    if (!requireAdmin(admin)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.email || !body.password || !body.name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const pwCheck = isValidPassword(body.password);
    if (!pwCheck.valid) {
      return NextResponse.json(
        { error: pwCheck.message },
        { status: 400 }
      );
    }

    const existing = (await findBy("users", "email", body.email)) as User | undefined;
    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    const newUser: User = {
      id: generateId(),
      email: body.email.trim().toLowerCase(),
      password: hashPassword(body.password),
      name: body.name,
      role: body.role || "author",
      createdAt: new Date().toISOString(),
    };

    await insert("users", newUser as unknown as Record<string, unknown>);

    const { password: _, ...safe } = newUser;
    return NextResponse.json({ user: safe }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
