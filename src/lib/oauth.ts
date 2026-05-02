import { Google } from "google-oauth-lib";

const GOOGLE_OAUTH_CONFIG = {
  client_id: process.env.GOOGLE_CLIENT_ID || "",
  client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
  redirect_uri: `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google/callback`,
  scope: ["openid", "email", "profile"],
};

const oauth2Client = Google.OAuth(GOOGLE_OAUTH_CONFIG);

export { oauth2Client };
