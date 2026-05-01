import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/jwt";
import { oauth2Client } from "@/lib/oauth";

const GET = (async (req: NextRequest) => {
    const token = req.cookies.get("s-token");
    const redirectUrl = oauth2Client.oauth.url({
        response_type: "code",
        redirect_uri: process.env.NEXT_PUBLIC_API_BASE_URL + "/auth/google/callback",
        access_type: "offline",
        prompt: "consent"
    });
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