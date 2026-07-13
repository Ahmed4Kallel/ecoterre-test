import { NextRequest, NextResponse } from "next/server";
import { getSession, requireAdmin } from "@/lib/auth";
import { findAll, insert, remove } from "@/lib/db";
import { generateId } from "@/lib/utils";
import type { SiteSetting } from "@/lib/types";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const user = await getSession();
    if (!requireAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = findAll<SiteSetting>("settings");
    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }
    return NextResponse.json({ settings: map });
  } catch {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getSession();
    if (!requireAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const existing = findAll<SiteSetting>("settings");

    for (const [key, value] of Object.entries(body)) {
      const existingItem = existing.find((s) => s.key === key);
      if (existingItem) {
        const index = existing.findIndex((s) => s.key === key);
        existing[index] = { key, value: String(value) };
      } else {
        existing.push({ key, value: String(value) });
      }
    }

    const filePath = path.join(process.cwd(), "src", "data", "settings.json");
    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), "utf-8");

    return NextResponse.json({ success: true, settings: existing });
  } catch {
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
