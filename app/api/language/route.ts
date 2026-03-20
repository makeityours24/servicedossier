import { NextResponse } from "next/server";
import { getLocaleFromValue } from "@/lib/i18n";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = getLocaleFromValue(searchParams.get("lang"));
  const redirectTo = searchParams.get("redirect") || "/";

  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  response.cookies.set("salondossier-locale", locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365
  });

  return response;
}
