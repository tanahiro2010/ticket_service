import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { SectionCard } from "@/components/ui/SectionCard";
import { statusMap } from "@/constants/status";
import type { TicketStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

type SearchContext = {
  searchParams: Promise<{
    page?: string;
    min?: string;
    max?: string;
  }>;
};

const MAX_VIEW_COUNT = 10;

function parseQueryInt(value?: string) {
  if (value === undefined || value === null || value.trim() === "") {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function buildSearchHref(params: { page: number; min?: number; max?: number }) {
  const query = new URLSearchParams();

  if (params.page > 0) {
    query.set("page", String(params.page));
  }

  if (params.min !== undefined) {
    query.set("min", String(params.min));
  }

  if (params.max !== undefined) {
    query.set("max", String(params.max));
  }

  const queryString = query.toString();
  return queryString
    ? `/manager/tickets/search?${queryString}`
    : "/manager/tickets/search";
}

export default async function TicketSearchPage({
  searchParams,
}: SearchContext) {
  const { page, min, max } = await searchParams;
  const pageInt = Math.max(parseQueryInt(page) ?? 0, 0);
  const minInt = parseQueryInt(min);
  const maxInt = parseQueryInt(max);
  const hasSearchParams = minInt !== undefined || maxInt !== undefined;

  const normalizedMin = minInt ?? 0;
  const normalizedMax = maxInt ?? normalizedMin;
  const rangeMin = Math.min(normalizedMin, normalizedMax);
  const rangeMax = Math.max(normalizedMin, normalizedMax);
  const reversedRange =
    minInt !== undefined &&
    maxInt !== undefined &&
    normalizedMin > normalizedMax;

  const totalCount = hasSearchParams
    ? await prisma.ticket.count({
        where: {
          index: {
            gte: rangeMin,
            lte: rangeMax,
          },
        },
      })
    : 0;

  const totalPages =
    totalCount === 0 ? 0 : Math.ceil(totalCount / MAX_VIEW_COUNT);
  const currentPage =
    totalPages === 0 ? 0 : Math.min(pageInt, Math.max(totalPages - 1, 0));

  const result = hasSearchParams
    ? await prisma.ticket.findMany({
        where: {
          index: {
            gte: rangeMin,
            lte: rangeMax,
          },
        },
        take: MAX_VIEW_COUNT,
        skip: currentPage * MAX_VIEW_COUNT,
        orderBy: {
          index: "asc",
        },
        select: {
          id: true,
          num: true,
          index: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    : [];

  const showingFrom = totalCount === 0 ? 0 : currentPage * MAX_VIEW_COUNT + 1;
  const showingTo = Math.min((currentPage + 1) * MAX_VIEW_COUNT, totalCount);
  const hasPreviousPage = currentPage > 0;
  const hasNextPage = currentPage + 1 < totalPages;

  return (
    <PageShell className="bg-white px-4 py-8 text-black sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <SectionCard className="p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-medium tracking-wide text-gray-600">
                Ticket Search
              </p>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight">
                  index範囲検索
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-gray-700 sm:text-base">
                  チケットのindexを範囲指定して検索できます。番号の揺れを気にせず、受付順の近いチケットをまとめて確認したいときに使います。
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded border border-black bg-white px-4 py-3 text-sm text-black">
                <span className="block text-xs uppercase tracking-[0.18em] text-gray-600">
                  Search Range
                </span>
                <span className="mt-1 block text-lg font-semibold text-black">
                  {hasSearchParams ? `${rangeMin} 〜 ${rangeMax}` : "未指定"}
                </span>
              </div>
              <div className="rounded border border-black bg-white px-4 py-3 text-sm text-black">
                <span className="block text-xs uppercase tracking-[0.18em] text-gray-600">
                  Result Count
                </span>
                <span className="mt-1 block text-lg font-semibold text-black">
                  {hasSearchParams ? totalCount : "-"}
                </span>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="検索条件"
          description="min / max を入力すると、index がその範囲に入るチケットを検索します。"
          action={
            <Link
              href="/manager/tickets"
              className="inline-flex items-center justify-center rounded border border-black bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-gray-100"
            >
              一覧へ戻る
            </Link>
          }
        >
          <form
            method="get"
            className="grid gap-4 px-6 py-5 sm:px-8 lg:grid-cols-4"
          >
            <label className="space-y-2 text-sm font-medium text-black">
              <span className="block text-gray-600">最小index</span>
              <input
                type="number"
                name="min"
                defaultValue={min ?? ""}
                placeholder="例: 100"
                className="w-full rounded border border-black px-4 py-2.5 text-black focus:outline-none focus:ring-2 focus:ring-black"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-black">
              <span className="block text-gray-600">最大index</span>
              <input
                type="number"
                name="max"
                defaultValue={max ?? ""}
                placeholder="例: 200"
                className="w-full rounded border border-black px-4 py-2.5 text-black focus:outline-none focus:ring-2 focus:ring-black"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-black">
              <span className="block text-gray-600">ページ番号</span>
              <input
                type="number"
                name="page"
                min={0}
                defaultValue={page ?? "0"}
                placeholder="0"
                className="w-full rounded border border-black px-4 py-2.5 text-black focus:outline-none focus:ring-2 focus:ring-black"
              />
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded border border-black bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-900"
              >
                検索する
              </button>
            </div>
          </form>

          <div className="border-t border-black px-6 py-4 text-sm text-gray-600 sm:px-8">
            ページ番号は0始まりです。検索し直すときはページ番号が0に戻るようにしてください。
          </div>
        </SectionCard>

        {hasSearchParams ? (
          <SectionCard
            title="検索結果"
            description={
              totalCount === 0
                ? "該当するチケットはありません"
                : `${showingFrom}〜${showingTo}件目を表示しています`
            }
            action={
              totalCount > 0 ? (
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm text-gray-600">
                    {currentPage + 1} / {totalPages} ページ
                  </p>
                  <Link
                    href={buildSearchHref({
                      page: 0,
                      min: rangeMin,
                      max: rangeMax,
                    })}
                    className="inline-flex items-center justify-center rounded border border-black bg-white px-3 py-1 text-sm font-medium text-black transition hover:bg-gray-100"
                  >
                    最初のページへ
                  </Link>
                </div>
              ) : null
            }
          >
            {reversedRange ? (
              <div className="border-b border-black px-6 py-5 text-sm text-amber-700 sm:px-8">
                最小値と最大値が逆だったため、自動的に入れ替えて検索しています。
              </div>
            ) : null}

            {result.length === 0 ? (
              <div className="px-6 py-16 text-center sm:px-8">
                <div className="mx-auto max-w-md space-y-3">
                  <h3 className="text-xl font-semibold text-black">
                    該当するチケットがありません
                  </h3>
                  <p className="text-sm leading-6 text-gray-600 sm:text-base">
                    範囲を広げるか、ページ番号を0に戻して再検索してください。
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-black">
                {result.map((ticket) => {
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
                            <span className="inline-flex items-center rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700">
                              index {ticket.index}
                            </span>
                          </div>

                          <div className="grid gap-2 text-sm text-gray-700 sm:grid-cols-2 sm:gap-x-8">
                            <p>
                              <span className="mr-2 text-gray-600">
                                作成日時
                              </span>
                              <span className="font-medium text-black">
                                {formatDate(ticket.createdAt)}
                              </span>
                            </p>
                            <p>
                              <span className="mr-2 text-gray-600">
                                更新日時
                              </span>
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
              <div className="flex flex-col gap-3 border-t border-black px-6 py-5 sm:px-8 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-600">
                  {currentPage + 1} / {totalPages} ページ
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={buildSearchHref({
                      page: Math.max(currentPage - 1, 0),
                      min: rangeMin,
                      max: rangeMax,
                    })}
                    className={`inline-flex items-center justify-center rounded border px-4 py-2.5 text-sm font-medium transition ${
                      hasPreviousPage
                        ? "border-black bg-white text-black hover:bg-gray-100"
                        : "pointer-events-none border-gray-200 bg-gray-100 text-gray-400"
                    }`}
                  >
                    前へ
                  </Link>
                  <Link
                    href={buildSearchHref({
                      page: currentPage + 1,
                      min: rangeMin,
                      max: rangeMax,
                    })}
                    className={`inline-flex items-center justify-center rounded border px-4 py-2.5 text-sm font-medium transition ${
                      hasNextPage
                        ? "border-black bg-black text-white hover:bg-gray-900"
                        : "pointer-events-none border-gray-200 bg-gray-100 text-gray-400"
                    }`}
                  >
                    次へ
                  </Link>
                </div>
              </div>
            ) : null}
          </SectionCard>
        ) : (
          <SectionCard
            title="使い方"
            description="まずは範囲を指定して検索してください。"
          >
            <div className="px-6 py-12 sm:px-8">
              <div className="max-w-2xl space-y-3 text-sm leading-6 text-gray-600 sm:text-base">
                <p>
                  最小indexと最大indexを入れると、その間にあるチケットが一覧表示されます。
                </p>
                <p>
                  検索後は、結果カードを開いて個別詳細へ移動できます。まずは小さめの範囲で試すのが分かりやすいです。
                </p>
              </div>
            </div>
          </SectionCard>
        )}
      </div>
    </PageShell>
  );
}
