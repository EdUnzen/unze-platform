import { updateSession } from "@/lib/supabase/middleware";
import {
  getCrossDomainRedirect,
  getInternalRedirect,
  PATHNAME_HEADER,
  resolveSiteMode,
  SITE_HEADER,
} from "@/lib/constants/site";
import { NextResponse, NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host");
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;

  const internalRedirect = getInternalRedirect(pathname, search);
  if (internalRedirect) {
    return NextResponse.redirect(new URL(internalRedirect, request.url), 308);
  }

  const crossRedirect = getCrossDomainRedirect(host, pathname, search);
  if (crossRedirect) {
    return NextResponse.redirect(crossRedirect, 308);
  }

  const siteMode = resolveSiteMode(host, pathname);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(SITE_HEADER, siteMode);
  requestHeaders.set(PATHNAME_HEADER, pathname);
  requestHeaders.set("x-url", request.url);

  const requestWithSite = new NextRequest(request.url, {
    headers: requestHeaders,
  });

  return updateSession(requestWithSite);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm)$).*)",
  ],
};
