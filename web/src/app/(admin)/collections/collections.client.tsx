"use client";

import { buttonVariants } from "@/components/ui/button";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { usePagination } from "@/hooks/use-pagination";
import { api } from "@/trpc/react";
import { MoveRight } from "lucide-react";
import { useQueryState } from "nuqs";

const PAGE_SIZE = 10;

export type CollectionsClientPageProps = {};

function CollectionsClientPage({}: CollectionsClientPageProps) {
  const [page, setPage] = useQueryState("page", {
    shallow: false,
    history: "push",
    parse: (v) => parseInt(v),
  });
  const collectionsQuery = api.tools.collections.fetchAll.useQuery({});

  const totalCount = collectionsQuery.data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: page ?? 1,
    totalPages,
    paginationItemsToDisplay: 5,
  });

  return (
    <div className="flex min-h-dvh w-full flex-col items-center space-y-6 p-6">
      {/* Current "our picks" */}

      {/* Create new */}
      <div className="flex w-full items-center justify-center rounded-md border border-border/30 bg-card/30 p-6">
        <a
          href="/collections/new"
          className={buttonVariants({ variant: "secondary" })}
        >
          Create Collections Collection
        </a>
      </div>

      {/* Collections */}
      {collectionsQuery.data?.collections.map((collection) => {
        return (
          <div
            key={collection.id}
            className="group relative flex h-[300px] w-full cursor-pointer flex-col justify-between gap-2 overflow-hidden rounded-md border border-border bg-card p-4"
          >
            <img
              src={collection.image}
              alt={`${collection.name} image`}
              className="absolute left-0 top-0 w-full rounded-md object-cover"
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
                  {collection.CollectionTools.flatMap((ct) => ct.Tool).map(
                    (tool) => (
                      <img
                        key={tool.id}
                        src={tool.image}
                        alt={`${tool.name} image`}
                        className="max-h-8 max-w-8 rounded-sm bg-background object-cover"
                      />
                    ),
                  )}
                </div>
                <a
                  href={`/collections/${collection.slug}/update`}
                  className="flex w-fit items-center gap-2 rounded-full bg-background/50 px-3 py-1 text-sm hover:bg-background/70"
                >
                  <span className="">Edit Collection</span>
                  <MoveRight className="size-4" />
                </a>
              </div>
            </div>
          </div>
        );
      })}

      <PaginationBar
        page={page ?? 1}
        totalPages={totalPages}
        pages={pages}
        showLeftEllipsis={showLeftEllipsis}
        showRightEllipsis={showRightEllipsis}
        setPage={setPage}
      />
    </div>
  );
}
export default CollectionsClientPage;
