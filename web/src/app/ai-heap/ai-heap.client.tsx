"use client";

import { AiHeapNode } from "@/types/AiHeapNode";
import { AiHeapVisualization } from "@/components/AiHeapVisualization";

export type AiHeapClientPageProps = {
  data: AiHeapNode[];
};

export function AiHeapClientPage({ data }: AiHeapClientPageProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="p-4 text-center text-3xl font-bold">AI Heap</header>
      <AiHeapVisualization data={data} />
    </div>
  );
}
