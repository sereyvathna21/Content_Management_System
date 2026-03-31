import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import * as jose from "jose";
import type { JWTEncodeParams, JWTDecodeParams } from "next-auth/jwt";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

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
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.accessToken = (user as { accessToken?: string }).accessToken;
        token.remember = (user as { remember?: boolean }).remember;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      (session.user as { role?: string }).role = token.role as string;
      (session as { accessToken?: string }).accessToken = token.accessToken as string;
      (session.user as { remember?: boolean }).remember = token.remember as boolean;
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