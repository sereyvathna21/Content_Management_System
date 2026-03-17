import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!res.ok) return null;

          const data = await res.json();
          return {
            id: data.user.id.toString(),
            email: data.user.email,
            name: data.user.fullName,
            role: data.user.role,
            accessToken: data.token,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.accessToken = (user as { accessToken?: string }).accessToken;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      (session.user as { role?: string }).role = token.role as string;
      (session as { accessToken?: string }).accessToken = token.accessToken as string;
      return session;
    },
  },
  pages: {
    signIn: "/Authentication/Login",
  },
  session: {
    strategy: "jwt",
  },
});
