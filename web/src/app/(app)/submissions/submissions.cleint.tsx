"use client";

import ToolCard from "@/app/_components/tool-card";
import { Button } from "@/components/ui/button";
import { Tag, Tool } from "@prisma/client";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export type SubmissionsClientPageProps = {
  tools: { tool: Tool; tags: Tag[] }[];
};

export function SubmissionsClientPage({ tools }: SubmissionsClientPageProps) {
  console.log(tools);
  const router = useRouter();
  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full max-w-3xl flex-col justify-center p-6">
        <div className="flex w-full flex-col gap-6">
          <div className="mb-6 flex w-full justify-between">
            <span className="text-2xl">My Tools</span>

            <Button
              className="flex gap-2"
              onClick={() => {
                router.push("/submissions/new");
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
                    router.push("/submissions/new");
                  }}
                >
                  <Plus />
                  <span>Create</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2">
              {tools.map((item) => (
                <ToolCard
                  href={`/submissions/${item.tool.id}/update`}
                  tool={item.tool}
                  tags={item.tags}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
