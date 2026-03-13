import { NextResponse } from "next/server";

const cookieNames = [
    "next-auth.session-token",
    "next-auth.csrf-token",
    "next-auth.callback-url",
    "__Secure-next-auth.session-token",
    "__Secure-next-auth.callback-url",
    "__Host-next-auth.csrf-token",
];

export async function POST() {
    const response = NextResponse.json({ success: true });

    for (const cookieName of cookieNames) {
        response.cookies.set({
            name: cookieName,
            value: "",
            path: "/",
            expires: new Date(0),
        });
    }

    return response;
}
