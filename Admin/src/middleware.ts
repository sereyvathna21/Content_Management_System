import { auth } from "@/auth";
import { NextResponse } from "next/server";

const AUTH_PATHS = [
  "/Authentication/Login",
  "/Authentication/Register",
  "/Authentication/Forgetpassword",
  "/Authentication/Resetpassword",
  "/Terms",
  "/Privacy",
];

// Standard client-guarded paths
const CLIENT_GUARDED_ROUTES = [
  { path: "/news/create", permission: "news:create" },
];

// Sensitive security paths requiring live verification
const SENSITIVE_SECURITY_ROUTES = [
  { path: "/users", permission: "users:read" },
  { path: "/settings/roles", permission: "roles:read" },
];

const BACKEND_URL =
  process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

// Lightweight local map cache (Key: UserID, Value: { permissions: string[], timestamp: number })
const middlewareCache = new Map<string, { permissions: string[]; timestamp: number }>();
const CACHE_TTL = 60000; // 60 seconds

function normalizeRole(role?: string | null) {
  return role?.trim().toLowerCase().replace(/[_\s-]/g, "");
}

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isAuthPath = AUTH_PATHS.some((p) => nextUrl.pathname.startsWith(p));

  if (!isLoggedIn && !isAuthPath) {
    return NextResponse.redirect(new URL("/Authentication/Login", nextUrl));
  }

  if (isLoggedIn) {
    if (isAuthPath && !nextUrl.pathname.startsWith("/Terms") && !nextUrl.pathname.startsWith("/Privacy")) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }

    const token = (req.auth as any).accessToken;
    const userId = (req.auth as any).user?.id;
    const userRole = (req.auth as any).user?.role;
    const normalizedRole = normalizeRole(userRole);

    // SuperAdmin bypass
    if (normalizedRole === "superadmin") {
      return NextResponse.next();
    }

    // A. Check Highly Sensitive Pages (Live backend verification with memory cache throttling)
    const matchingSensitive = SENSITIVE_SECURITY_ROUTES.find((rule) => nextUrl.pathname.startsWith(rule.path));
    if (matchingSensitive) {
      let activePermissions: string[] = [];
      const cached = middlewareCache.get(userId);

      // Warning: In serverless/edge environments (like Vercel), global Map variables might clear on cold starts.
      // In those environments, the middleware will hit the backend verify endpoint more frequently.
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        activePermissions = cached.permissions;
      } else {
        try {
          const verifyRes = await fetch(`${BACKEND_URL}/api/auth/verify-session`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!verifyRes.ok) {
            return NextResponse.redirect(new URL("/unauthorized", nextUrl));
          }

          const data = await verifyRes.json();
          activePermissions = data.permissions || [];

          // Save to middleware local memory
          middlewareCache.set(userId, { permissions: activePermissions, timestamp: Date.now() });
        } catch (err) {
          // Fail-safe default: reject navigation if validation endpoint fails
          return NextResponse.redirect(new URL("/unauthorized", nextUrl));
        }
      }

      if (!activePermissions.includes(matchingSensitive.permission)) {
        return NextResponse.redirect(new URL("/unauthorized", nextUrl));
      }
    }

    // B. Check Standard Pages (Fast Cookie validation)
    const matchingClient = CLIENT_GUARDED_ROUTES.find((rule) => nextUrl.pathname.startsWith(rule.path));
    if (matchingClient) {
      const userPermissions = (req.auth as any).user?.permissions || [];
      if (!userPermissions.includes(matchingClient.permission)) {
        return NextResponse.redirect(new URL("/unauthorized", nextUrl));
      }
    }
  }
});

export const config = {
  matcher: [
    "/((?!api/auth|api|_next/static|_next/image|favicon.ico|images|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.ico).*)",
  ],
};