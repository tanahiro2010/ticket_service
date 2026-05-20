"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CenterCard } from "@/components/layout/Center";
import Button from "@/components/ui/button";

export default function Manager() {
  const router = useRouter();
  const handleTicketSubmit = async (e: FormData) => {
    const toaster = toast.loading("チケット情報を確認中...");
    try {
      const number = e.get("number") as string;
      if (!number) {
        toast.error("チケット番号を入力してください", { id: toaster });
        return;
      }

      const response = await fetch(
        `/api/tickets?number=${encodeURIComponent(number)}`,
      );
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error, { id: toaster });
        return;
      }

      router.push("/manager/tickets/" + data.data.id);
      toast.success("チケットが見つかりました", { id: toaster });
    } catch (e) {
      console.error(e);
      toast.error("エラーが発生しました", {
        description: (e as Record<string, string>).message,
        id: toaster,
      });
    }
  };

  return (
    <CenterCard>
      <h1 className="text-4xl font-bold">チケットマネージャー</h1>
      <form
        action={handleTicketSubmit}
        className="mt-5 space-y-4 w-full max-w-md"
      >
        <input
          type="number"
          name="number"
          className="border border-black rounded px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="チケットIDを入力"
        />
        <Button className="w-full" type="submit">
          検索
        </Button>
      </form>

      <Link
        href="/manager/tickets"
        className="mt-5 text-sm text-gray-600 hover:text-black transition"
      >
        チケット一覧へ
      </Link>
      <Link 
        href="/manager/tickets/search"
        className="mt-5 text-sm text-gray-600 hover:text-black transition"
      >チケット検索</Link>
    </CenterCard>
  );
}
