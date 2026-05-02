import { betterAuth } from "better-auth";
import Database from "better-sqlite3";

/**
 * @todo sqliteから適切なものに変更する
 */
export const auth = betterAuth({
  database: new Database("./sqlite.db"),
  socialProviders: {
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      hd: "@sandagakuen.ed.jp",
      prompt: "consent",
    },
  },
});
