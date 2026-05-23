import type { NextRequest } from "next/server";
import type { TicketStatus, User } from "@/generated/prisma/client";
import type { TicketUpdateInput } from "@/generated/prisma/models";
import { withAuth } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/response";

type Context = {
  params: Promise<{ id: string }>;
};

const GET = (req: NextRequest, ctx: Context) =>
  withAuth<Context>(
    req,
    async (_: NextRequest, user: Partial<User>, ctx: Context | undefined) => {
      if (!user?.email?.endsWith("@sandagakuen.ed.jp")) {
        return apiResponse.forbidden("アクセスが拒否されました");
      }
      if (!ctx)
        return apiResponse.internalServerError(
          "チケットIDの取得に失敗しました",
        );

      try {
        const { id } = await ctx.params;
        if (!id) return apiResponse.badRequest("チケットIDが必要です");

        const ticket = await prisma.ticket.findUnique({
          where: { id },
        });

        if (!ticket) {
          return apiResponse.notFound("チケットが見つかりません");
        }

        return apiResponse.success(ticket);
      } catch (e) {
        console.error(e);
        return apiResponse.internalServerError("チケットの取得に失敗しました");
      }
    },
    ctx,
  );

const PUT = (req: NextRequest, ctx: Context) =>
  withAuth<Context>(
    req,
    async (_: NextRequest, user: Partial<User>, ctx: Context | undefined) => {
      if (!user?.email?.endsWith("@sandagakuen.ed.jp")) {
        return apiResponse.forbidden("アクセスが拒否されました");
      }
      if (!ctx)
        return apiResponse.internalServerError(
          "チケットIDの取得に失敗しました",
        );

      try {
        const [{ id }, { status }]: [{ id: string }, { status: TicketStatus }] =
          await Promise.all([ctx.params, req.json()]);

        if (!id) return apiResponse.badRequest("チケットIDが必要です");
        if (!status) return apiResponse.badRequest("ステータスが必要です");

        const ticket = await prisma.ticket.findUnique({ where: { id } });

        if (!ticket) {
          return apiResponse.notFound("チケットが見つかりません");
        }

        const payload: TicketUpdateInput = { status };

        // If we're moving a skipped (CALLED) ticket back to OPEN (待機),
        // place it at the end of the current in-venue / waiting queue by
        // bumping its numeric `index` to (max existing index) + 1.
        if (ticket.status === "CALLED" && status === "OPEN") {
          const agg = await prisma.ticket.aggregate({
            where: { status: { in: ["ENTERED", "OPEN"] } },
            _max: { index: true },
          });
          const maxIndex = agg._max.index ?? 0;
          payload.index = maxIndex + 1;
        }

        if (status === "CLOSED") {
          payload.closedAt = new Date();
        }

        const updatedTicket = await prisma.ticket.update({
          where: { id },
          data: payload,
        });

        return apiResponse.success(updatedTicket);
      } catch (e) {
        console.error(e);
        return apiResponse.internalServerError("チケットの更新に失敗しました");
      }
    },
    ctx,
  );

export { GET, PUT };
