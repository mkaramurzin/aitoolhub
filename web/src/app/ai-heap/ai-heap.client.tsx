"use client";

import { useState } from "react";
import { AiHeapNode } from "@/types/AiHeapNode";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

export type AiHeapClientPageProps = {
  data: AiHeapNode[];
};

export function AiHeapClientPage({ data }: AiHeapClientPageProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="p-4 text-center text-3xl font-bold">AI Heap</header>
      <div className="flex-1 overflow-auto p-4">
        {data.map((node) => (
          <AiHeapNodeView key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
}

function AiHeapNodeView({ node }: { node: AiHeapNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="pl-4">
      <div
        className="flex cursor-pointer items-center gap-1"
        onClick={() => setOpen((o) => !o)}
      >
        {node.children && (
          <ChevronDownIcon
            className={`size-4 transition-transform ${open ? "rotate-0" : "-rotate-90"}`}
          />
        )}
        <span className="font-medium">{node.name}</span>
      </div>
      {open && node.children && (
        <div className="pl-4">
          {node.children.map((child) => (
            <AiHeapNodeView key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}
