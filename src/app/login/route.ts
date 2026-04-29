import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const GOOGLE_OAUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth?response_type=code&scope=openid%20email%20profile";

const GET = (async (req: NextRequest) => {
    const token = await req.cookies.get("s-token");
    if (token) {

    }

    const redirectUrl = new URL(GOOGLE_OAUTH_URL);
    redirectUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID || "");
    redirectUrl.searchParams.set("redirect_uri", process.env.NEXT_PUBLIC_API_BASE_URL + "/auth/google/callback");
    return NextResponse.redirect(redirectUrl);
});

export { GET };