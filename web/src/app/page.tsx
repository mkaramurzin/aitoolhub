import { HydrateClient } from "@/trpc/server";
import { EmailCapture } from "./_components/email-capture";

export default async function Home() {
  return (
    <HydrateClient>
      <div className="flex h-dvh w-dvw flex-col items-center justify-center gap-2">
        <div className="flex items-center text-3xl">
          <span className="text-primary">AI</span>
          <span className="">toolhub</span>
        </div>

        <span className="text-xl text-white/60">Coming soon</span>

        <div className="my-4 flex flex-col items-center gap-2">
          <span className="text-primary/90">
            Be the first to know when we launch.
          </span>
          <EmailCapture />
        </div>
      </div>
    </HydrateClient>
  );
}
