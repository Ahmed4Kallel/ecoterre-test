import { NextRequest, NextResponse } from "next/server";
import { subscribeNewsletter, unsubscribeNewsletter } from "@/lib/db";
import { isValidEmail } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const { blocked, response, headers } = checkRateLimit(request, { limit: 5, windowMs: 60_000 });
    if (blocked && response) return response;

    const { email, action } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400, headers }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400, headers }
      );
    }

    if (action === "unsubscribe") {
      const success = await unsubscribeNewsletter(email.trim().toLowerCase());
      return NextResponse.json({
        success,
        message: success
          ? "Unsubscribed successfully"
          : "Email not found",
      }, { headers });
    }

    const subscriber = await subscribeNewsletter(email.trim().toLowerCase());
    return NextResponse.json(
      {
        success: true,
        message: "Subscribed successfully",
        subscriber: { id: subscriber.id, email: subscriber.email },
      },
      { status: 201, headers }
    );
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to process newsletter subscription" },
      { status: 500 }
    );
  }
}
