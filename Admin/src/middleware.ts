import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

function getFrontendLoginUrl(request: NextRequest): URL {
  const configured = process.env.FRONTEND_LOGIN_URL;

  if (configured) {
    return new URL(configured);
  }

  // Local fallback: frontend app route
  return new URL("http://localhost:3000/Landing-page/Authentication/Login");
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Skip middleware for Next.js internals and auth API routes
  if (pathname.startsWith("/_next") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Try the default cookie name first; fall back to the __Secure- prefix
  // used by next-auth in HTTPS environments so both dev and prod are covered.
  const secret = process.env.NEXTAUTH_SECRET;
  const token =
    (await getToken({ req: request, secret })) ??
    (await getToken({
      req: request,
      secret,
      cookieName: "__Secure-next-auth.session-token",
    }));

  const loginUrl = getFrontendLoginUrl(request);
  const callbackUrl = `${request.nextUrl.origin}${pathname}${search}`;

  if (!token) {
    loginUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(loginUrl);
  }

  const rolesRaw = token.roles;
  const roles = Array.isArray(rolesRaw)
    ? rolesRaw.map((role) => String(role).toLowerCase())
    : [];

  if (!roles.includes("admin")) {
    loginUrl.searchParams.set("error", "forbidden");
    loginUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware only on page/API routes — exclude all static assets,
  // Next.js internals, and common public-folder file extensions so that
  // image/font/icon requests are never delayed by auth checks.
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot|otf|map)$).*)",
  ],
};
