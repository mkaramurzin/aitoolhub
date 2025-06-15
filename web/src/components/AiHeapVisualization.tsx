"use client";

import { useState } from "react";
import { AiHeapNode } from "@/types/AiHeapNode";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDownIcon,
  GlobeAltIcon,
  UserIcon,
  BuildingOffice2Icon,
  CodeBracketIcon,
  SparklesIcon,
  PresentationChartBarIcon,
} from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";
import { NodeDetailModal } from "./NodeDetailModal";

const iconMap = {
  general: GlobeAltIcon,
  consumer: UserIcon,
  enterprise: BuildingOffice2Icon,
  coding: CodeBracketIcon,
  agent: SparklesIcon,
  benchmarks: PresentationChartBarIcon,
} as const;

export type AiHeapVisualizationProps = {
  data: AiHeapNode[];
};

export function AiHeapVisualization({ data }: AiHeapVisualizationProps) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <>
      <div className="h-full w-full overflow-auto p-4">
        {data.map((node) => (
          <AiHeapNodeView
            key={node.id}
            node={node}
            depth={0}
            onNodeClick={(id) => setSelected(id)}
          />
        ))}
      </div>
      <NodeDetailModal
        nodeId={selected}
        open={selected !== null}
        onOpenChange={(o) => !o && setSelected(null)}
      />
    </>
  );
}

type AiHeapNodeViewProps = {
  node: AiHeapNode;
  depth: number;
  onNodeClick: (id: string) => void;
};

function AiHeapNodeView({ node, depth, onNodeClick }: AiHeapNodeViewProps) {
  const [open, setOpen] = useState(true);
  const Icon = iconMap[node.category] ?? SparklesIcon;
  return (
    <div className="pl-4">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={cn(
          "mb-2 flex cursor-pointer items-center gap-2 rounded-md bg-secondary p-3 text-base font-medium",
          depth === 0 && "bg-primary text-lg text-primary-foreground",
        )}
        onClick={() => onNodeClick(node.id)}
      >
        <Icon className="size-5" />
        <span className="flex-1">{node.name}</span>
        {node.children && (
          <ChevronDownIcon
            onClick={(e) => {
              e.stopPropagation();
              setOpen((o) => !o);
            }}
            className={cn(
              "size-4 transition-transform",
              open ? "rotate-0" : "-rotate-90",
            )}
          />
        )}
      </motion.div>
      <AnimatePresence initial={false}>
        {open && node.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pl-4"
          >
            {node.children.map((child) => (
              <AiHeapNodeView
                key={child.id}
                node={child}
                depth={depth + 1}
                onNodeClick={onNodeClick}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
