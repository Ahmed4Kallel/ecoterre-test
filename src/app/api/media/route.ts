import { NextRequest, NextResponse } from "next/server";
import { getSession, requireAdmin } from "@/lib/auth";
import { isVercel } from "@/lib/database";
import type { MediaItem } from "@/lib/types";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function GET() {
  try {
    const user = await getSession();
    if (!requireAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!fs.existsSync(UPLOAD_DIR)) {
      return NextResponse.json({ files: [] });
    }

    const files = fs.readdirSync(UPLOAD_DIR).map((name) => {
      const filePath = path.join(UPLOAD_DIR, name);
      const stats = fs.statSync(filePath);
      const item: MediaItem = {
        name,
        url: `/uploads/${name}`,
        size: stats.size,
        createdAt: stats.birthtime.toISOString(),
      };
      return item;
    });

    files.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ files });
  } catch {
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getSession();
    if (!requireAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isVercel()) {
      return NextResponse.json(
        { error: "La suppression de fichiers n'est pas disponible en démo." },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("file");

    if (!fileName) {
      return NextResponse.json({ error: "File name required" }, { status: 400 });
    }

    const basename = path.basename(fileName);
    if (basename !== fileName) {
      return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
    }

    const filePath = path.join(UPLOAD_DIR, basename);
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(UPLOAD_DIR))) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
