import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["fr", "ar"];
const defaultLocale = "fr";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";
  const proto = host.includes("localhost") ? "http" : "https";

  if (pathname.startsWith("/api")) {
    const method = request.method;

    if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
      return NextResponse.next();
    }

    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");

    if (origin || referer) {
      const requestOrigin = origin || (referer ? new URL(referer).origin : null);

      if (requestOrigin) {
        const allowedOrigins = [
          `${proto}://${host}`,
          `${proto}://localhost:3000`,
        ];

        if (!allowedOrigins.includes(requestOrigin)) {
          return NextResponse.json(
            { error: "Invalid origin" },
            { status: 403 }
          );
        }
      }
    }

    return NextResponse.next();
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/uploads") ||
    pathname.includes(".")
  ) {
    const response = NextResponse.next();
    if (pathname.startsWith("/admin")) {
      response.headers.set("x-current-path", pathname);
    }
    return response;
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (pathnameHasLocale) return NextResponse.next();

  const locale = defaultLocale;
  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next|uploads|favicon.ico).*)"],
};
