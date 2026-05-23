import type { TicketStatus } from "@/generated/prisma/enums";
import type { TicketWhereInput } from "@/generated/prisma/models";
import { statusMap } from "@/constants/status";
import { prisma } from "@/lib/prisma";
import { SectionCard } from "@/components/ui/SectionCard";
import Link from "next/link";


type TicketsProps = {
  searchParams: Promise<{ page?: string; today?: string }>;
};

const TICKET_COUNT = 10;

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function buildPageHref(page: number, onlyToday?: boolean) {
  const params = new URLSearchParams();
  if (page > 0) params.set("page", String(page));
  if (onlyToday) params.set("today", "1");
  return params.toString()
    ? `/manager/tickets?${params.toString()}`
    : "/manager/tickets";
}

export default async function Tickets({ searchParams }: TicketsProps) {
  const { page, today } = await searchParams;
  const requestedPage = Number.parseInt(page ?? "0", 10);
  const onlyToday = today === "1" || today === "true";
  const normalizedPage =
    Number.isNaN(requestedPage) || requestedPage < 0 ? 0 : requestedPage;

  const where: TicketWhereInput = {};
  if (onlyToday) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    where.createdAt = { gte: start, lt: end };
  }

  const totalCount = await prisma.ticket.count({ where });
  const totalPages =
    totalCount === 0 ? 0 : Math.ceil(totalCount / TICKET_COUNT);
  const currentPage =
    totalPages === 0 ? 0 : Math.min(normalizedPage, totalPages - 1);

  const tickets = await prisma.ticket.findMany({
    where,
    take: TICKET_COUNT,
    skip: currentPage * TICKET_COUNT,
    select: {
      id: true,
      num: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const showingFrom = totalCount === 0 ? 0 : currentPage * TICKET_COUNT + 1;
  const showingTo = Math.min((currentPage + 1) * TICKET_COUNT, totalCount);
  const hasPreviousPage = currentPage > 0;
  const hasNextPage = currentPage + 1 < totalPages;

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-black sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <SectionCard className="p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium tracking-wide text-gray-600">
                Manager Console
              </p>
              <div className="space-y-1.5">
                <h1 className="text-3xl font-semibold tracking-tight">
                  チケット一覧
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-gray-700 sm:text-base">
                  受付されたチケットを新しい順に確認できます。状態と更新日時が一目で分かるため、次に対応すべきチケットを素早く判断できます。
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
              <div className="rounded border border-black bg-white px-4 py-3 text-sm text-black">
                <span className="block text-xs uppercase tracking-[0.18em] text-gray-600">
                  Total Tickets
                </span>
                <span className="mt-1 block text-2xl font-semibold text-black">
                  {totalCount}
                </span>
              </div>
              <Link
                href="/manager"
                className="inline-flex items-center justify-center rounded border border-black bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-gray-100"
              >
                チケット番号で検索
              </Link>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="一覧表示"
          description={
            totalCount === 0
              ? onlyToday
                ? "本日作成されたチケットはありません"
                : "現在表示されるチケットはありません"
              : `${showingFrom}〜${showingTo}件目を表示しています`
          }
          action={
            totalCount > 0 || onlyToday ? (
              <div className="flex items-center gap-4">
                {totalCount > 0 && (
                  <p className="text-sm text-gray-600">
                    {currentPage + 1} / {totalPages} ページ
                  </p>
                )}

                <Link
                  href={buildPageHref(0, !onlyToday)}
                  className="inline-flex items-center justify-center rounded border border-black bg-white px-3 py-1 text-sm font-medium text-black transition hover:bg-gray-100"
                >
                  {onlyToday ? "今日のみを解除" : "今日のみを表示"}
                </Link>
              </div>
            ) : null
          }
        >
          {tickets.length === 0 ? (
            <div className="px-6 py-16 text-center sm:px-8">
              <div className="mx-auto max-w-md space-y-3">
                <h3 className="text-xl font-semibold text-black">
                  チケットがまだありません
                </h3>
                <p className="text-sm leading-6 text-gray-600 sm:text-base">
                  チケットが作成されるとここに一覧表示されます。特定の番号を確認したい場合は、検索画面から直接照会してください。
                </p>
                <div className="pt-2">
                  <Link
                    href="/manager"
                    className="inline-flex items-center justify-center rounded border border-black bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-900"
                  >
                    検索画面へ戻る
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-black">
              {tickets.map((ticket) => {
                const status = statusMap[ticket.status as TicketStatus];

                return (
                  <Link
                    key={ticket.id}
                    href={`/manager/tickets/${ticket.id}`}
                    className="group block px-6 py-5 transition hover:bg-gray-50 focus:bg-gray-50 focus:outline-none sm:px-8"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="inline-flex min-w-20 items-center justify-center rounded-full bg-black px-3 py-1 text-sm font-semibold text-white">
                            #{ticket.num}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </div>

                        <div className="grid gap-2 text-sm text-gray-700 sm:grid-cols-2 sm:gap-x-8">
                          <p>
                            <span className="mr-2 text-gray-600">作成日時</span>
                            <span className="font-medium text-black">
                              {formatDate(ticket.createdAt)}
                            </span>
                          </p>
                          <p>
                            <span className="mr-2 text-gray-600">更新日時</span>
                            <span className="font-medium text-black">
                              {formatDate(ticket.updatedAt)}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 md:min-w-36 md:justify-end">
                        <span className="text-sm text-gray-600 transition group-hover:text-black">
                          詳細を見る
                        </span>
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black text-black transition group-hover:text-gray-700">
                          →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {totalCount > 0 ? (
            <div className="flex flex-col gap-3 border-t border-black px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <p className="text-sm text-gray-600">
                1ページあたり {TICKET_COUNT} 件まで表示しています。
              </p>
              <div className="flex items-center gap-3">
                {hasPreviousPage ? (
                  <Link
                    href={buildPageHref(currentPage - 1, onlyToday)}
                    className="inline-flex items-center justify-center rounded border border-black bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-gray-100"
                  >
                    前のページ
                  </Link>
                ) : (
                  <span className="inline-flex cursor-not-allowed items-center justify-center rounded border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400">
                    前のページ
                  </span>
                )}

                {hasNextPage ? (
                  <Link
                    href={buildPageHref(currentPage + 1, onlyToday)}
                    className="inline-flex items-center justify-center rounded border border-black bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-900"
                  >
                    次のページ
                  </Link>
                ) : (
                  <span className="inline-flex cursor-not-allowed items-center justify-center rounded border border-gray-300 bg-gray-200 px-4 py-2 text-sm font-medium text-gray-500">
                    次のページ
                  </span>
                )}
              </div>
            </div>
          ) : null}
        </SectionCard>
      </div>
    </main>
  );
}
