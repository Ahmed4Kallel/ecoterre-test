import { NextRequest, NextResponse } from "next/server";
import { getSession, requireAuthor } from "@/lib/auth";
import { saveMedia } from "@/lib/db";
import { isAllowedMimeType, isSafeFileExtension, sanitizeFilename } from "@/lib/validation";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const BLOCKED_EXTENSIONS = [
  ".php", ".phtml", ".pht", ".php3", ".php4", ".php5", ".php7", ".php8",
  ".asp", ".aspx", ".ashx", ".asmx", ".ascx",
  ".jsp", ".jspx", ".jspf",
  ".cgi", ".pl", ".py", ".rb",
  ".exe", ".dll", ".bat", ".cmd", ".sh", ".ps1",
  ".htaccess", ".htpasswd",
];

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!requireAuthor(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!isAllowedMimeType(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: jpeg, png, gif, webp" },
        { status: 400 }
      );
    }

    if (!isSafeFileExtension(file.name)) {
      return NextResponse.json(
        { error: "Invalid file type" },
        { status: 400 }
      );
    }

    const ext = path.extname(file.name).toLowerCase();
    if (BLOCKED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: "Invalid file type" },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum 5MB" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const safeExt = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext) ? ext : ".jpg";
    const filename = `upload_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}${safeExt}`;
    const filePath = path.join(uploadDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const url = `/uploads/${filename}`;

    await saveMedia({
      id: uuidv4(),
      filename,
      original_name: sanitizeFilename(file.name),
      mime_type: file.type,
      size: file.size,
      url,
      uploaded_by: user!.id,
    });

    return NextResponse.json({ url }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
