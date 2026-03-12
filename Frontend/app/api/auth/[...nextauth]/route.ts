import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5001";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) return null;
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
                        id: data.user.id,
                        email: data.user.email,
                        name: data.user.name,
                        image: data.user.avatar,
                        accessToken: data.token,
                        roles: data.user.roles,
                    };
                } catch {
                    return null;
                }
            },
        }),
    ],

    callbacks: {
        async signIn({ user, account }) {
            // Exchange Google id_token for our backend JWT
            if (account?.provider === "google" && account.id_token) {
                try {
                    const res = await fetch(`${BACKEND_URL}/api/auth/google`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ idToken: account.id_token }),
                    });
                    if (!res.ok) return false;
                    const data = await res.json();
                    user.id = data.user.id;
                    user.name = data.user.name;
                    user.image = data.user.avatar;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (user as any).accessToken = data.token;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (user as any).roles = data.user.roles;
                } catch {
                    return false;
                }
            }
            return true;
        },

        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                token.accessToken = (user as any).accessToken;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                token.roles = (user as any).roles;
            }
            return token;
        },

        async session({ session, token }) {
            session.user.id = token.id as string;
            session.accessToken = token.accessToken as string;
            session.user.roles = token.roles as string[];
            return session;
        },
    },

    pages: {
        signIn: "/Landing-page/Authentication/Login",
        error: "/Landing-page/Authentication/Login",
    },

    session: { strategy: "jwt" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
