"use client";
import { SearchResultsPage, SelectedTags } from "@/app/_components/search";
import { TrendingUp } from "lucide-react";

export type TrendingClientPageProps = {};

export function TrendingClientPage(props: TrendingClientPageProps) {
  return (
    <div className="flex h-full w-full flex-col items-center pt-10">
      <div className="flex w-full max-w-3xl flex-col">
        <div className="flex w-full items-center gap-2 px-4">
          <TrendingUp className="size-10 fill-primary text-primary" />
          <span className="text-2xl">Trending</span>
        </div>

        <div className="w-full justify-start px-4">
          <SelectedTags />
        </div>

        <div className="flex w-full flex-1 justify-center pt-4">
          <SearchResultsPage showSearch={false} orderBy="trending" />
        </div>
      </div>
    </div>
  );
}
