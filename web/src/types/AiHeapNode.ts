export type AiHeapCategory =
  | "general"
  | "consumer"
  | "enterprise"
  | "coding"
  | "agent"
  | "benchmarks";

export interface AiHeapNode {
  id: string;
  name: string;
  category: AiHeapCategory;
  parentId?: string | null;
  url?: string;
  image?: string;
  metadata?: unknown;
  children?: AiHeapNode[];
}
