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
  {
    id: "enterprise",
    name: "Enterprise",
    category: "enterprise",
    children: [
      {
        id: "crm",
        name: "CRM Tools",
        category: "enterprise",
      },
    ],
  },
  {
    id: "coding",
    name: "Coding",
    category: "coding",
    children: [
      {
        id: "copilot",
        name: "GitHub Copilot",
        category: "coding",
      },
    ],
  },
  {
    id: "agent",
    name: "Agents",
    category: "agent",
    children: [
      {
        id: "autogpt",
        name: "AutoGPT",
        category: "agent",
      },
    ],
  },
  {
    id: "benchmarks",
    name: "Benchmarks",
    category: "benchmarks",
    children: [
      {
        id: "lmsys",
        name: "LMSYS",
        category: "benchmarks",
      },
    ],
  },
];

export default function AiHeapPage() {
  return <AiHeapClientPage data={exampleData} />;
}
