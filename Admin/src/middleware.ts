import { auth } from "@/auth";
import { NextResponse } from "next/server";

const AUTH_PATHS = [
  "/Authentication/Login",
  "/Authentication/Register",
  "/Authentication/Forgetpassword",
  "/Authentication/Resetpassword",
];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isAuthPath = AUTH_PATHS.some((p) => nextUrl.pathname.startsWith(p));

  if (!isLoggedIn && !isAuthPath) {
    return NextResponse.redirect(new URL("/Authentication/Login", nextUrl));
  }

  if (isLoggedIn && nextUrl.pathname.startsWith("/Authentication/Login")) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }
});

export const config = {
  matcher: [
    "/((?!api/auth|api|_next/static|_next/image|favicon.ico|images|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.ico).*)",
  ],
};