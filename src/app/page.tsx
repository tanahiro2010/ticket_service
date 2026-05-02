import Button from "@/components/ui/button";

export default function Home() {
  return (
    <main className="h-screen flex flex-col items-center justify-center bg-white">
      <section className="space-y-5">
        <h1 className="text-5xl font-bold">順番待ち管理システム</h1>

        <div className="space-x-5 flex justify-center">
          <Button href={`/login`}>管理パネル</Button>

          <Button href={`/monitor`}>公衆モニター</Button>
        </div>
      </section>
    </main>
  );
}
