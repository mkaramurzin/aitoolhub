"use client";
import ToolCard from "@/app/_components/tool-card";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { usePagination } from "@/hooks/use-pagination";
import { api } from "@/trpc/react";

import { useQueryState } from "nuqs";
export type FavoriteClientPageProps = {};
const PAGE_SIZE = 18;

export function FavoriteClientPage(props: FavoriteClientPageProps) {
  const [page, setPage] = useQueryState("page", {
    shallow: false,
    history: "push",
    parse: (v) => parseInt(v),
    defaultValue: 1,
  });

  const toolSkeletons = Array.from({ length: 20 }, (_, i) => (
    <ToolCard.Skeleton key={i} />
  ));

  const favoriteToolsQuery = api.tools.favorites.fetchAll.useQuery({
    page,
    take: PAGE_SIZE,
  });

  const totalCount = favoriteToolsQuery.data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: page,
    totalPages,
    paginationItemsToDisplay: 5,
  });

  const tools = favoriteToolsQuery.data?.favorites.flatMap((f) => f.Tool) ?? [];

  return (
    <div className="flex h-full w-full justify-center">
      <div className="flex h-full w-full max-w-5xl flex-col items-center space-y-4 p-4 sm:pt-10">
        <h1 className="text-3xl font-bold">My Favorite Tools</h1>
        {tools && tools.length > 0 ? (
          <div className="flex w-full flex-col items-center px-4">
            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool) => (
                <ToolCard
                  href={`/tools/${tool.id}`}
                  tool={tool}
                  key={tool.id}
                  tags={tool.ToolTags.flatMap((tag) => tag.Tag)}
                  analytics={tool.ToolAnalytics}
                  isFavorite={tool.UserToolFavorite.length > 0}
                />
              ))}
            </div>

            <PaginationBar
              page={page ?? 1}
              totalPages={totalPages}
              pages={pages}
              showLeftEllipsis={showLeftEllipsis}
              showRightEllipsis={showRightEllipsis}
              setPage={setPage}
            />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {favoriteToolsQuery.isPending ? (
              <div className="flex w-full flex-col items-center px-4">
                <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {toolSkeletons}
                </div>
              </div>
            ) : (
              <span className="text-3xl text-muted">No tools found.</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
