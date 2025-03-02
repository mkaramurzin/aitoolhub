"use client";
import { SearchResultsPage, SelectedTags } from "@/app/_components/search";
import { Plane } from "lucide-react";

export type NewClientPageProps = {};

export function NewClientPage(props: NewClientPageProps) {
  return (
    <div className="flex h-full w-full flex-col items-center pt-10">
      <div className="flex w-full max-w-3xl flex-col">
        <div className="flex w-full items-center gap-2 px-4">
          <Plane
            strokeWidth={1}
            className="size-10 fill-primary text-primary"
          />
          <span className="text-2xl">Just Launched</span>
        </div>

        <div className="w-full justify-start px-4">
          <SelectedTags />
        </div>

        <div className="flex w-full flex-1 justify-center pt-4">
          <SearchResultsPage showSearch={false} orderBy="new" />
        </div>
      </div>
    </div>
  );
}
