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
  const router = useRouter();
  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex w-full flex-col items-center p-6">
        <div className="flex w-full flex-col items-center gap-6">
          <div className="mb-6 flex w-full max-w-3xl justify-between">
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

          <div className="flex w-full max-w-5xl">
            {tools.length > 0 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tools.map((item) => (
                  <ToolCard
                    key={item.tool.id}
                    href={`/submissions/${item.tool.id}/update`}
                    tool={item.tool}
                    tags={item.tags}
                    isFavorite={false}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
