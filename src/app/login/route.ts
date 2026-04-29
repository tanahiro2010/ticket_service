import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/jwt";

const GOOGLE_OAUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth?response_type=code&scope=openid%20email%20profile";
const GOOGLE_OAUTH_CONFIG = {
    response_type: "code",
    scope: [
        "openid",
        "email",
        "profile"
    ],
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    redirect_uri: process.env.NEXT_PUBLIC_API_BASE_URL + "/auth/google/callback",
}

const GET = (async (req: NextRequest) => {
    const token = req.cookies.get("s-token");
    const redirectUrl = new URL(GOOGLE_OAUTH_URL);
    for (const [key, value] of Object.entries(GOOGLE_OAUTH_CONFIG)) {
        if (Array.isArray(value)) {
            redirectUrl.searchParams.set(key, value.join(" "));
        } else {
            redirectUrl.searchParams.set(key, value);
        }
    }

    if (token) {
        try {
            const payload = await verifyJwt(token.value);
            if (payload && payload.exp && payload.exp > Math.floor(Date.now() / 1000)) {
                // Token is valid and not expired, redirect to home page
                return NextResponse.redirect(new URL("/manager", req.url));
            }
        } catch (err) {          // Invalid token, proceed to redirect to Google OAuth
            return NextResponse.redirect(redirectUrl);            
        }
    }

    return NextResponse.redirect(redirectUrl);
});

export { GET };