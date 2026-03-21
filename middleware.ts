import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { extractTenantSlugFromHostname } from "@/lib/tenant";

const publiekePaden = ["/login", "/wachtwoord-vergeten", "/wachtwoord-reset"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    const response = NextResponse.next();
    setSecurityHeaders(response);
    return response;
  }

  const tenantSlug = extractTenantSlugFromHostname(request.headers.get("host") ?? "");
  const requestHeaders = new Headers(request.headers);

  if (tenantSlug) {
    requestHeaders.set("x-tenant-slug", tenantSlug);
  } else {
    requestHeaders.delete("x-tenant-slug");
  }

  const heeftSessie = request.cookies.has("salon_session");
  const isPubliek = publiekePaden.some((pad) => pathname.startsWith(pad));

  if (!heeftSessie && !isPubliek) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    setSecurityHeaders(response);
    return response;
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
  setSecurityHeaders(response);
  return response;
}

function setSecurityHeaders(response: NextResponse) {
  const isProduction = process.env.NODE_ENV === "production";

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-site");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  if (isProduction) {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      isProduction
        ? "script-src 'self' 'unsafe-inline'"
        : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https:",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join("; ")
  );
}

export const config = {
  matcher: ["/((?!api/export).*)"]
};
