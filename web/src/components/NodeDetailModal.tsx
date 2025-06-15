"use client";

import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { AiHeapNode } from "@/types/AiHeapNode";

export type NodeDetailModalProps = {
  nodeId: string | null;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
};

function findNode(
  nodes: AiHeapNode[],
  id: string,
  path: AiHeapNode[] = [],
): { node: AiHeapNode; path: AiHeapNode[] } | null {
  for (const n of nodes) {
    if (n.id === id) return { node: n, path: [...path, n] };
    if (n.children) {
      const res = findNode(n.children, id, [...path, n]);
      if (res) return res;
    }
  }
  return null;
}

export function NodeDetailModal({
  nodeId,
  open,
  onOpenChange,
}: NodeDetailModalProps) {
  const query = api.aiHeap.getAll.useQuery(undefined, {
    enabled: open && !!nodeId,
  });

  const details = useMemo(() => {
    if (!query.data || !nodeId) return null;
    return findNode(query.data.nodes, nodeId);
  }, [query.data, nodeId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {query.isPending ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : query.isError ? (
          <div className="text-destructive">Failed to load node.</div>
        ) : details ? (
          <div className="space-y-3">
            <DialogHeader>
              <DialogTitle>{details.node.name}</DialogTitle>
              <DialogDescription>{details.node.category}</DialogDescription>
            </DialogHeader>
            {details.node.metadata && (
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(details.node.metadata, null, 2)}
              </pre>
            )}
            <div className="text-sm text-muted-foreground">
              Position: {details.path.map((p) => p.name).join(" > ")}
            </div>
          </div>
        ) : (
          <div>Node not found.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
