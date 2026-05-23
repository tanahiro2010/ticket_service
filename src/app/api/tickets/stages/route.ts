import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/response";

const GET = async () => {
  try {
    const rows = await prisma.ticket.findMany({
      distinct: ["prefix"],
      select: { prefix: true },
      orderBy: { prefix: "asc" },
    });

    const prefixes = rows.map((r) => r.prefix).filter(Boolean) as string[];

    return apiResponse.success(prefixes);
  } catch (error) {
    console.error(error);
    return apiResponse.internalServerError("ステージ一覧の取得に失敗しました");
  }
};

export { GET };
