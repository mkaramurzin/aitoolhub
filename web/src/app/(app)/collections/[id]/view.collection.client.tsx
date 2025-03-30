"use client";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { Collection, Review, Tag, Tool } from "@prisma/client";
import { ExternalLink } from "lucide-react";
import React from "react";

export function CollectionClientPage({
  collection,
  tools,
}: {
  collection: Collection;
  tools: { tool: Tool; review?: Review; tags: Tag[] }[];
}) {
  const tryItNowTrackingMutation = api.tools.analytics.increment.useMutation(
    {},
  );

  return (
    <div className="flex h-full w-full justify-center">
      <div className="flex h-full w-full max-w-3xl flex-col items-center space-y-4 p-4 sm:pt-10">
        {/* Collection Header */}
        <div className="group relative flex h-[150px] w-full flex-col justify-between gap-2 overflow-hidden rounded-md border border-border bg-card p-4 md:h-[300px]">
          <img
            src={collection.image}
            alt={`${collection.name} image`}
            className="absolute left-0 top-1/2 w-full -translate-y-1/2 self-center rounded-md object-cover"
          />

          {/* Background gradient */}
          <div className="to-slate-[#000000] absolute bottom-0 left-0 h-2/6 w-full bg-gradient-to-t from-slate-800/70 transition-all duration-500 group-hover:h-3/6"></div>
          <div className="to-slate-[#000000] absolute left-0 top-0 h-2/6 w-full bg-gradient-to-b from-slate-800/70 transition-all duration-500 group-hover:h-3/6"></div>

          <div className="z-10 flex w-full text-start">
            <div className="flex w-full flex-col text-2xl font-semibold drop-shadow-lg">
              <span className="">{collection.name}</span>
            </div>
          </div>

          <div className="z-10 flex flex-col text-start">
            <div className="flex w-full flex-col justify-between gap-4 md:flex-row md:items-end">
              <div className="flex gap-2">
                {tools.map((item) => (
                  <img
                    key={item.tool.id}
                    src={item.tool.image}
                    alt={`${item.tool.name} image`}
                    className="max-h-8 max-w-8 rounded-sm bg-background object-cover"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tools */}
        {tools.map((item) => {
          return (
            <React.Fragment key={item.tool.id}>
              <div className="group flex w-full flex-col rounded-md border-border bg-primary/10 p-4">
                {/* Image and name desktop */}
                <div className="mb-4 hidden gap-4 sm:flex">
                  <img
                    src={item.tool.image}
                    alt={item.tool.name}
                    className="size-24 rounded-md"
                  />
                  <div className="flex w-full flex-col">
                    <div className="mb-2 flex flex-col">
                      <div className="flex justify-between">
                        <span className="w-fit cursor-pointer text-2xl underline-offset-1 hover:underline">
                          {item.tool.name}
                        </span>

                        <a
                          href={item.tool.url}
                          target="_blank"
                          className={cn(buttonVariants(), "mb-2 flex gap-2")}
                          onClick={() => {
                            tryItNowTrackingMutation.mutate({
                              id: item.tool.id,
                              tryItNowClicks: true,
                            });
                          }}
                        >
                          <span>Try it now</span>
                          <ExternalLink className="size-4" />
                        </a>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-4">
                      {item.tags.map((tag) => (
                        <Badge
                          variant={"secondary"}
                          key={tag.name}
                          className="cursor-pointer"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Image and name mobile */}
                <div className="mb-4 flex flex-col gap-4 sm:hidden">
                  <div className="flex gap-4">
                    <img
                      src={item.tool.image}
                      alt={item.tool.name}
                      className="size-20 rounded-md"
                    />
                    <div className="flex w-full flex-col">
                      <div className="mb-2 flex flex-col">
                        <div className="flex justify-between">
                          <span className="w-fit cursor-pointer text-2xl underline-offset-1 hover:underline">
                            {item.tool.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-4">
                    {item.tags.map((tag) => (
                      <Badge
                        variant={"secondary"}
                        key={tag.name}
                        className="cursor-pointer"
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <a
                  href={item.tool.url}
                  target="_blank"
                  className={cn(
                    buttonVariants(),
                    "flex h-12 w-full gap-2 sm:hidden",
                  )}
                  onClick={() => {
                    tryItNowTrackingMutation.mutate({
                      id: item.tool.id,
                      tryItNowClicks: true,
                    });
                  }}
                >
                  <span>Try it now</span>
                  <ExternalLink className="size-4" />
                </a>
              </div>
              <span className="w-full">{item.review?.content}</span>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
