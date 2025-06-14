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
  url?: string;
  image?: string;
  children?: AiHeapNode[];
}
