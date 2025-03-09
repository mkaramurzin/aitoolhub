"use client";

import { Button } from "@/components/ui/button";
import { Tool } from "@prisma/client";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export type SubmitClientPageProps = {
  tools: Tool[];
};

export function SubmitClientPage({ tools }: SubmitClientPageProps) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full max-w-3xl flex-col justify-center p-6">
        <div className="flex w-full flex-col gap-6">
          <div className="mb-6 flex w-full justify-between">
            <span className="text-2xl">Tools</span>

            <Button
              className="flex gap-2"
              onClick={() => {
                router.push("/submit/new");
              }}
            >
              <Plus />
              <span>Create</span>
            </Button>
          </div>

          {tools.length < 1 ? (
            <div className="flex w-full items-center justify-center">
              <div className="flex flex-col items-center justify-center space-y-2 rounded-md text-center sm:p-32">
                <span className="text-2xl font-semibold">
                  Submit Your AI Tool
                </span>

                <span className="text-muted-foreground">
                  Share your AI tool with our community and reach thousands of
                  potential users.
                </span>

                <Button
                  className="flex gap-2"
                  onClick={() => {
                    router.push("/submit/new");
                  }}
                >
                  <Plus />
                  <span>Create</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3">
              {tools.map((tool) => (
                <ToolsCard tool={tool} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ToolsCard({ tool }: { tool: Tool }) {
  return (
    <div className="flex cursor-pointer flex-col rounded-md border border-border p-4 hover:bg-primary/30"></div>
  );
}
