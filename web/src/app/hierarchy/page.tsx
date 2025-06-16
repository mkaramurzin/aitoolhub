import type { Metadata } from "next";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "AI Hierarchy | AiToolHub",
  description:
    "Explore how different AI models and tools relate to each other.",
};

/**
 * Basic levels that make up the hierarchy.
 * Visualization components will be inserted in place of the placeholders below.
 */
const LEVELS = [
  { label: "Models", color: "from-purple-500 to-purple-700" },
  { label: "Frameworks", color: "from-indigo-500 to-indigo-700" },
  { label: "Applications", color: "from-teal-500 to-teal-700" },
] as const;

export default function HierarchyPage() {
  return (
    <main className="flex h-dvh w-dvw flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="space-y-4 text-center">
        <h1 className="text-5xl font-bold">AI Hierarchy</h1>
        <p className="text-muted-foreground">
          Visualize the relationships between AI layers. More coming soon.
        </p>
      </div>

      {/* Placeholder containers for future diagrams */}
      <div className="mt-12 grid w-full max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
        {LEVELS.map(({ label, color }) => (
          <div key={label} className="flex flex-col items-center space-y-2">
            <span className="font-semibold">{label}</span>
            <div
              className={cn(
                "h-32 w-full rounded-lg border border-dashed border-border",
                `bg-gradient-to-br ${color}/20`,
              )}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
