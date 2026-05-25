import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import * as jose from "jose";
import type { JWTEncodeParams, JWTDecodeParams } from "next-auth/jwt";

// Use a server-only internal URL when available, otherwise fall back to the
// public URL (used by client-side code) or localhost for local development.
const BACKEND_URL =
  process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

const SESSION_MAX_AGE = 24 * 60 * 60; // 1 day
const SESSION_DEFAULT_AGE = 24 * 60 * 60; // 1 day

function getSecretKey(secret: string | string[]): Uint8Array {
  const s = Array.isArray(secret) ? secret[0] : secret;
  return new TextEncoder().encode(s);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        remember: { label: "Remember", type: "text" },
      },
      authorize: async (credentials) => {
        const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
            remember: credentials.remember,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          // allow NextAuth to receive the backend message
          throw new Error(data?.message || "Invalid email or password.");
        }
        return {
          id: data.user.id.toString(),
          email: data.user.email,
          name: data.user.fullName,
          role: data.user.role,
          accessToken: data.token,
          remember: credentials.remember === "true",
          permissions: data.user.permissions || [],
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.accessToken = (user as any).accessToken;
        token.remember = (user as any).remember;
        token.permissions = (user as any).permissions || [];
        console.log(`[NextAuth JWT] Initialized permissions for user ${user.email}:`, token.permissions);
      }

      if (trigger === "update") {
        if (session?.permissions) {
          token.permissions = session.permissions;
          console.log(`[NextAuth JWT] Updated permissions from session payload:`, token.permissions);
        } else if (token.accessToken) {
          try {
            const res = await fetch(`${BACKEND_URL}/api/auth/verify-session`, {
              headers: { Authorization: `Bearer ${token.accessToken}` },
            });
            if (res.ok) {
              const data = await res.json();
              token.permissions = data.permissions || [];
              console.log(`[NextAuth JWT] Fetched fresh permissions from backend verify-session:`, token.permissions);
            }
          } catch (err) {
            console.error("[NextAuth JWT] Failed to sync permissions on update:", err);
          }
        }
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      (session.user as any).role = token.role as string;
      (session as any).accessToken = token.accessToken as string;
      (session.user as any).remember = token.remember as boolean;
      (session.user as any).permissions = (token.permissions as string[]) || [];
      return session;
    },
  },
  pages: {
    signIn: "/Authentication/Login",
  },
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE,
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: SESSION_MAX_AGE,
      },
    },
  },
  jwt: {
    encode: async (params: JWTEncodeParams) => {
      if (!params.secret) throw new Error("AUTH_SECRET is not set");

      const token = params.token ?? {};
      const rememberFlag = Boolean((token as { remember?: boolean }).remember);
      const maxAgeSeconds = rememberFlag ? SESSION_MAX_AGE : SESSION_DEFAULT_AGE;

      const payload: Record<string, unknown> = {
        id: (token as any).id,
        email: (token as any).email,
        name: (token as any).name,
        role: (token as any).role,
        accessToken: (token as any).accessToken,
        remember: rememberFlag,
        // Persist permissions in the signed JWT so client session retains them after reload
        permissions: (token as any).permissions ?? [],
      };

      return await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(Math.floor(Date.now() / 1000) + maxAgeSeconds)
        .sign(getSecretKey(params.secret));
    },
    decode: async (params: JWTDecodeParams) => {
      if (!params.secret || !params.token) return null;
      try {
        const { payload } = await jose.jwtVerify(params.token, getSecretKey(params.secret), {
          algorithms: ["HS256"],
        });
        return payload as Record<string, unknown>;
      } catch {
        return null;
      }
    },
  },
});