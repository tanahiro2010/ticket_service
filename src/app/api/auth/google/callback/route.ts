import { type NextRequest, NextResponse } from "next/server";
import { oauth2Client } from "@/lib/oauth";

const GMAIL_DOMAIN = "@sandagakuen.ed.jp";

const GET = async (req: NextRequest) => {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json(
      { error: "Authorization code is missing" },
      { status: 400 },
    );
  }

  try {
    const tokenResponse = await oauth2Client.oauth.token(code);
    oauth2Client.accessToken = tokenResponse.access_token;
    const profile = await oauth2Client.user.profile();
    if (profile.email?.endsWith(GMAIL_DOMAIN)) {
      return NextResponse.redirect(new URL("/manager", req.url));
    }

    return NextResponse.redirect(new URL("/monitor", req.url));
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    return NextResponse.json(
      { error: "Failed to exchange code for token" },
      { status: 500 },
    );
  }
};

export { GET };
