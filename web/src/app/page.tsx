import { HydrateClient } from "@/trpc/server";

export default async function Home() {
  return (
    <HydrateClient>
      <div className="flex h-dvh w-dvw flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-2 text-3xl">
          <span>AI Tool</span>
          <span className="rounded-md bg-orange-500 px-1 py-0.5 text-black">
            Hub
          </span>
        </div>
        <span className="text-primary/30">Coming soon</span>
      </div>
    </HydrateClient>
  );
}
