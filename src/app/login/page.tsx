import Button from "@/components/ui/button";
import GoogleFillIcon from "@/components/ui/icons/Google";

export default function Home() {
  return (
    <main className="h-screen flex flex-col items-center justify-center bg-white w-full">
      <section className="space-y-5 w-full flex flex-col justify-center items-center">
        <h1 className="text-5xl font-bold">ログイン</h1>

        <div className="space-x-5 flex justify-center w-full max-w-2xl">
          <Button href={`/login`}>
            <GoogleFillIcon size={25} />
            <div className="grow">Googleでログイン</div>
          </Button>
        </div>
      </section>
    </main>
  );
}
