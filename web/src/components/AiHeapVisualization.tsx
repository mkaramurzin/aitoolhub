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
  return (
    <div className="h-full w-full overflow-auto p-4">
      {data.map((node) => (
        <AiHeapNodeView key={node.id} node={node} depth={0} />
      ))}
    </div>
  );
}

type AiHeapNodeViewProps = {
  node: AiHeapNode;
  depth: number;
};

function AiHeapNodeView({ node, depth }: AiHeapNodeViewProps) {
  const [open, setOpen] = useState(true);
  const Icon = iconMap[node.category] ?? SparklesIcon;
  return (
    <div className="pl-4">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={cn(
          "mb-2 flex cursor-pointer items-center gap-2 rounded-md bg-secondary p-3 text-base font-medium",
          depth === 0 && "bg-primary text-primary-foreground text-lg"
        )}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon className="size-5" />
        <span className="flex-1">{node.name}</span>
        {node.children && (
          <ChevronDownIcon
            className={cn(
              "size-4 transition-transform",
              open ? "rotate-0" : "-rotate-90"
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
              <AiHeapNodeView key={child.id} node={child} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

