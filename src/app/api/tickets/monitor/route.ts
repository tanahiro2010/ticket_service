import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/response";

const GET = async (req: NextRequest) => {
  const stage = req.nextUrl.searchParams.get("stage");
  if (!stage) {
    return apiResponse.badRequest("ステージパラメータが必要です");
  }

  try {
    // Reduce DB load by requesting only required fields.
    // Execute related reads in a single transaction for consistency
    const [calling, skipped, nextCandidates] = await prisma.$transaction([
      prisma.ticket.findMany({
        where: {
          status: { in: ["CALLING", "MEETING"] },
          prefix: stage,
        },
        orderBy: [{ status: "asc" }, { num: "asc" }],
        take: 3,
        select: {
          id: true,
          num: true,
          status: true,
          updatedAt: true,
          createdAt: true,
        },
      }),
      prisma.ticket.findMany({
        where: {
          status: "CALLED",
          prefix: stage,
        },
        orderBy: [{ updatedAt: "desc" }, { num: "asc" }],
        take: 8,
        select: {
          id: true,
          num: true,
          status: true,
          updatedAt: true,
        },
      }),
      prisma.ticket.findMany({
        where: { status: { in: ["ENTERED", "OPEN"] }, prefix: stage },
        // Use numeric `index` for ordering so tickets moved back to the queue
        // can be placed at the end by updating their `index` value.
        orderBy: [{ index: "asc" }],
        take: 5,
        select: {
          id: true,
          num: true,
          index: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    return apiResponse.success({
      open: nextCandidates,
      meeting: calling,
      skipped,
    });
  } catch (error) {
    console.error(error);
    return apiResponse.internalServerError(
      "モニター用チケット取得に失敗しました",
    );
  }
};

export { GET };
