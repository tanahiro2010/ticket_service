import Link from "next/link";
import type { JSX } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: JSX.Element | string;
  className?: string;
};
const Button = ({ children, className = "" }: Props) => {
  return (
    <button
      className={cn(
        `px-5 py-3 border rounded hover:bg-gray-100 cursor-pointer`,
        className,
      )}
      type={"button"}
    >
      {children}
    </button>
  );
};

export default function Home() {
  return (
    <main className="h-screen flex flex-col items-center justify-center bg-white">
      <section className="space-y-5">
        <h1 className="text-5xl font-bold">順番待ち管理システム</h1>

        <div className="space-x-5 flex justify-center">
          <Link href={`/login`}>
            <Button>管理パネル</Button>
          </Link>

          <Link href={`/monitor`}>
            <Button>公衆モニター</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
