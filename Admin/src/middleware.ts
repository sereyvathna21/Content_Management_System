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

  if (pathname.startsWith("/_next") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token =
    (await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })) ||
    (await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
