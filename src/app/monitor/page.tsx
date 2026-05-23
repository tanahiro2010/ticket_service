"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/layout/PageShell";
import { SectionCard } from "@/components/ui/SectionCard";
import type { Ticket } from "@/generated/prisma/client";

type TicketsResult = {
  open: Ticket[];
  meeting: Ticket[];
  skipped: Ticket[];
};

const POLLING_TIME = 1000 * 5;

export default function Monitor() {
  const [openTickets, setOpenTickets] = useState<Ticket[]>([]);
  const [meetingTickets, setMeetingTickets] = useState<Ticket[]>([]);
  const [skippedTickets, setSkippedTickets] = useState<Ticket[]>([]);
  const [stage, setStage] = useState<string | null>(null);
  const [stages, setStages] = useState<string[]>([]);
  const [isStageLoading, setIsStageLoading] = useState(true);
  const [showStageModal, setShowStageModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load available stages and remember last selected stage.
  useEffect(() => {
    let cancelled = false;

    const loadStages = async () => {
      try {
        const response = await fetch("/api/tickets/stages");
        const data = await response.json();
        if (response.ok && Array.isArray(data.data)) {
          setStages(data.data as string[]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (cancelled) return;
        setIsStageLoading(false);
        const saved = sessionStorage.getItem("monitor_stage");
        if (saved) {
          setStage(saved);
        } else {
          setShowStageModal(true);
        }
      }
    };

    void loadStages();
    return () => {
      cancelled = true;
    };
  }, []);

  // Start polling only after a stage is selected.
  useEffect(() => {
    if (!stage) return;
    let cancelled = false;

    const fetchTickets = async (): Promise<TicketsResult> => {
      const url = `/api/tickets/monitor?stage=${encodeURIComponent(stage)}`;
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }

      return data.data as TicketsResult;
    };

    const updateTickets = async () => {
      try {
        const result = await fetchTickets();
        setOpenTickets(result.open);
        setMeetingTickets(result.meeting);
        setSkippedTickets(result.skipped);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        toast.error("ポーリング中にエラーが発生しました", {
          description: (error as Error).message,
        });
      }
    };

    const poll = async () => {
      if (cancelled) return;
      await updateTickets();
      if (cancelled) return;
      setTimeout(() => {
        void poll();
      }, POLLING_TIME);
    };

    void poll();
    return () => {
      cancelled = true;
    };
  }, [stage]);

  const nextTicket = openTickets[0];

  return (
    <>
      {showStageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">
              ステージを選択してください
            </h2>
            {isStageLoading ? (
              <p>読み込み中...</p>
            ) : stages.length === 0 ? (
              <div>
                <p className="mb-3 text-sm text-gray-600">
                  利用可能なステージが見つかりません。手動で入力してください。
                </p>
                <input
                  type="text"
                  placeholder="例: A"
                  className="w-full rounded border px-3 py-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) {
                        sessionStorage.setItem("monitor_stage", val);
                        setStage(val);
                        setShowStageModal(false);
                        setIsLoading(true);
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div className="grid gap-2">
                {stages.map((s) => (
                  <button
                    key={s}
                    className="rounded border px-3 py-2 text-left hover:bg-gray-100"
                    onClick={() => {
                      sessionStorage.setItem("monitor_stage", s);
                      setStage(s);
                      setShowStageModal(false);
                      setIsLoading(true);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <PageShell
        className="px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8"
        contentClassName="flex h-[calc(100vh-2rem)] max-w-7xl flex-col gap-3 sm:gap-4 lg:gap-6"
      >
        <header className="flex items-center justify-between rounded-lg border border-black bg-white px-4 py-3 sm:px-6 sm:py-4">
          <div>
            <h1 className="text-lg font-bold sm:text-2xl">呼び出しモニター</h1>
            <p className="text-xs text-gray-600 sm:text-sm">
              現在の呼び出し状況を表示しています
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-gray-500 sm:text-xs">更新間隔</p>
            <p className="text-sm font-semibold sm:text-base">5秒</p>
          </div>
        </header>

        <div className="grid flex-1 grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6">
          <SectionCard
            className="flex min-h-0 flex-col"
            title="今、相談中の方"
            bodyClassName="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:p-5"
          >
            {isLoading ? (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-sm text-gray-600 sm:text-base">
                  読み込み中...
                </p>
              </div>
            ) : meetingTickets.length === 0 ? (
              <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 text-center">
                <p className="text-sm text-gray-600 sm:text-base">
                  現在相談中の方はいません
                </p>
              </div>
            ) : (
              <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                {meetingTickets.map((ticket, index) => (
                  <article
                    key={ticket.id}
                    className="flex flex-col justify-between rounded-lg border border-black bg-black p-4 text-white sm:p-5"
                  >
                    <p className="text-xs text-gray-200 sm:text-sm">
                      相談中 {index + 1}
                    </p>
                    <p className="mt-3 text-4xl font-bold leading-none sm:text-6xl">
                      {ticket.num}
                    </p>
                    <p className="mt-4 text-xs text-gray-200 sm:text-sm">
                      受付番号
                    </p>
                  </article>
                ))}
              </div>
            )}
          </SectionCard>

          <section className="grid min-h-0 grid-cols-1 gap-3 sm:gap-4">
            <SectionCard
              className="flex min-h-0 flex-col"
              title="次に呼ばれる方（最大5件）"
              description="先頭の方を次に呼び出します"
              bodyClassName="mt-3 min-h-0 flex-1 overflow-auto px-3 pb-3 sm:px-4 sm:pb-4"
            >
              {openTickets.length === 0 ? (
                <p className="text-sm text-gray-500">待機中の方はいません</p>
              ) : (
                <ul className="space-y-2">
                  {openTickets.slice(0, 5).map((ticket, index) => (
                    <li
                      key={ticket.id}
                      className="flex items-center justify-between rounded border border-black px-3 py-2"
                    >
                      <span className="text-sm text-gray-700">
                        {index + 1}番目
                      </span>
                      <span className="text-xl font-bold">{ticket.num}</span>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            <SectionCard
              className="flex min-h-0 flex-col"
              title="スキップした方"
              description="呼び出し時に不在だった方"
              bodyClassName="mt-3 min-h-0 flex-1 overflow-auto px-3 pb-3 sm:px-4 sm:pb-4"
            >
              {skippedTickets.length === 0 ? (
                <p className="text-sm text-gray-500">現在はいません</p>
              ) : (
                <ul className="space-y-2">
                  {skippedTickets.map((ticket) => (
                    <li
                      key={ticket.id}
                      className="flex items-center justify-between rounded border border-gray-300 px-3 py-2"
                    >
                      <span className="text-sm text-gray-700">番号</span>
                      <span className="text-lg font-semibold">
                        {ticket.num}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </section>
        </div>

        <footer className="rounded-lg border border-black bg-white px-4 py-2 text-xs text-gray-600 sm:px-6 sm:text-sm">
          次回予定: {nextTicket ? `受付番号 ${nextTicket.num}` : "なし"}
        </footer>
      </PageShell>
    </>
  );
}
