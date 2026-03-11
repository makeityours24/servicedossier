import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publiekePaden = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const heeftSessie = request.cookies.has("salon_session");
  const isPubliek = publiekePaden.some((pad) => pathname.startsWith(pad));

  if (!heeftSessie && !isPubliek) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/export).*)"]
};
