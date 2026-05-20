import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/response";

export async function POST(req: NextRequest) {
  const callbackToken = process.env.CALLBACK_TOKEN;
  if (!callbackToken) {
    console.error("CALLBACK_TOKEN is not configured");
    return apiResponse.internalServerError();
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    console.error("Invalid Authorization header, expected Bearer token");
    return apiResponse.unauthorized();
  }

  const token = authHeader.split(" ")[1];
  if (token !== callbackToken) {
    return apiResponse.unauthorized();
  }

  try {
    const rawData = await req.json();
    const venue = rawData["会場を選択してください（※広報入力）"];
    const receptionNumber =
      rawData["受付番号をえらんで選んでください（※広報入力）"] ??
      rawData["受付番号をえらんで選んでください\n（※広報入力）"];

    const result = await prisma.ticket.create({
      data: {
        num: venue + receptionNumber,
        prefix: venue,
        index: parseInt(receptionNumber),
        rawAnswer: rawData,
      },
    });
    return apiResponse.success(result, "Ticket created successfully");
  } catch (error) {
    console.error("Error creating ticket:", error);
    return apiResponse.internalServerError("Failed to create ticket");
  }
}
