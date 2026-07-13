import { NextRequest, NextResponse } from "next/server";
import { getSession, requireAdmin } from "@/lib/auth";
import { supabase } from "@/lib/database";

export async function GET() {
  try {
    const user = await getSession();
    if (!requireAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: rows } = await supabase.from("settings").select("key, value");
    const map: Record<string, string> = {};
    if (rows) {
      for (const row of rows) {
        map[row.key] = row.value;
      }
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
    const now = new Date().toISOString();

    for (const [key, value] of Object.entries(body)) {
      const { error } = await supabase.from("settings").upsert(
        { key, value: String(value), updated_at: now },
        { onConflict: "key" }
      );
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
