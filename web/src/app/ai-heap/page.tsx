import { type Metadata } from "next";
import { AiHeapClientPage } from "./ai-heap.client";
import { type AiHeapNode } from "@/types/AiHeapNode";

export const metadata: Metadata = {
  title: "AI Heap - AiToolHub",
};

const exampleData: AiHeapNode[] = [
  {
    id: "general",
    name: "General",
    category: "general",
    children: [
      {
        id: "openai",
        name: "OpenAI",
        category: "general",
        url: "https://openai.com",
      },
    ],
  },
  {
    id: "consumer",
    name: "Consumer",
    category: "consumer",
    children: [
      {
        id: "chatgpt",
        name: "ChatGPT",
        category: "consumer",
      },
    ],
  },
];

export default function AiHeapPage() {
  return <AiHeapClientPage data={exampleData} />;
}
