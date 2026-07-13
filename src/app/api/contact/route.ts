import { NextRequest, NextResponse } from "next/server";
import { insert } from "@/lib/db";
import { generateId } from "@/lib/utils";
import { isValidEmail, sanitizeText } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { isVercel } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    if (isVercel()) {
      return NextResponse.json({ error: "Le formulaire de contact n'est pas disponible en démo." }, { status: 400 });
    }

    const { blocked, response, headers } = checkRateLimit(request, { limit: 3, windowMs: 60_000 });
    if (blocked && response) return response;

    const { name, email, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400, headers }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400, headers }
      );
    }

    if (typeof message !== "string" || message.length > 5000) {
      return NextResponse.json(
        { error: "Message must be 5000 characters or less" },
        { status: 400, headers }
      );
    }

    const contact = {
      id: generateId(),
      name: sanitizeText(String(name).slice(0, 200)),
      email: email.trim().toLowerCase(),
      subject: subject ? sanitizeText(String(subject).slice(0, 500)) : "",
      message: sanitizeText(message),
      is_read: 0,
      created_at: new Date().toISOString(),
    };

    insert("contacts", contact);

    return NextResponse.json(
      { success: true, message: "Message sent successfully" },
      { status: 201, headers }
    );
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
