import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { usePagination } from "@/hooks/use-pagination";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { Tag } from "@prisma/client";
import { Loader2, Search, Star } from "lucide-react";
import millify from "millify";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
export type SearchPageProps = {
  tags?: Tag[];
};

export function SearchPage(props: SearchPageProps) {
  const [tags, setTags] = useQueryState("tags", {
    shallow: false,
    parse: (v) => v.split(","),
  });

  const [query, setQuery] = useQueryState("query", { shallow: false });

  return (
    <>
      {(!tags || tags.length < 1) && !query ? (
        <EmptySearchPage tags={props.tags} />
      ) : (
        <SearchResultsPage />
      )}
    </>
  );
}

export function SearchResultsPage({
  showSearch = true,
  orderBy,
}: {
  showSearch?: boolean;
  orderBy?: "trending" | "new";
}) {
  // Query states for tags, query string, and page number
  const [tags, setTags] = useQueryState("tags", {
    shallow: false,
    parse: (v) => v.split(",").filter((v) => v.length > 0),
  });
  const [query, setQuery] = useQueryState("query", { shallow: false });
  const [page, setPage] = useQueryState("page", {
    shallow: false,
    parse: (v) => parseInt(v),
  });

  // Call the API with page number, query and tags
  const toolsQuery = api.tools.fetchAll.useQuery({
    page: page ?? 1,
    query: query ?? undefined,
    tags: tags ?? undefined,
    orderBy,
  });

  const totalCount = toolsQuery.data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / 10);

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: page ?? 1,
    totalPages,
    paginationItemsToDisplay: 5,
  });

  return (
    <div className="flex w-full flex-col">
      {showSearch && (
        <div className="mb-4 flex w-full gap-6 px-4">
          <SearchBox />
          <Button className="flex h-12 w-12">
            <Search />
          </Button>
        </div>
      )}

      {toolsQuery.data && toolsQuery.data.tools.length > 0 ? (
        <>
          <div className="flex w-full flex-col items-center px-4">
            <div className="grid w-full grid-cols-1 gap-2 lg:grid-cols-2">
              {toolsQuery.data.tools.map((tool) => (
                <a
                  href={`/tools/${tool.id}`}
                  key={tool.id}
                  className="group flex w-full flex-col rounded-md border border-border bg-card p-4 hover:border-primary"
                >
                  {/* Image and name */}
                  <div className="mb-4 flex gap-4">
                    <img
                      src={tool.image}
                      alt={tool.name}
                      className="size-12 rounded-md"
                    />
                    <div className="flex w-full flex-col">
                      <div className="mb-2 flex w-full items-center justify-between">
                        <span className="w-fit cursor-pointer text-xl underline-offset-1 hover:underline">
                          {tool.name}
                        </span>

                        <div className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-primary">
                          <Star className={cn("size-4 fill-primary")} />
                          <span>
                            {Number(tool.rating) % 1 === 0
                              ? Number(tool.rating).toFixed(0)
                              : Number(tool.rating).toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <span className="text-muted-foreground">
                        {tool.description}
                      </span>
                    </div>
                  </div>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-4">
                    {tool.ToolTags.flatMap((tt) => tt.Tag).map((tag) => (
                      <Badge
                        variant={"secondary"}
                        key={tag.name}
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!tags?.includes(tag.name)) {
                            setTags([...(tags ?? []), tag.name]);
                          }
                        }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </a>
              ))}
            </div>
          </div>
          {/* Pagination UI */}
          <PaginationBar
            page={page ?? 1}
            totalPages={totalPages}
            pages={pages}
            showLeftEllipsis={showLeftEllipsis}
            showRightEllipsis={showRightEllipsis}
            setPage={setPage}
          />
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          {toolsQuery.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <span className="text-3xl">No tools found.</span>
          )}
        </div>
      )}
    </div>
  );
}

function SearchBox() {
  const [search, setSearch] = useState("");
  const [tags, setTags] = useQueryState("tags", {
    shallow: false,
    parse: (v) => v.split(",").filter((v) => v.length > 0),
  });
  const [page, setPage] = useQueryState("page", {
    shallow: false,
    parse: (v) => parseInt(v),
  });
  const router = useRouter();
  const [query, setQuery] = useQueryState("query", { shallow: false });
  const [showResults, setShowResults] = useState(false);
  const tagSearch = api.tags.search.useQuery(
    {
      query: search,
    },
    {
      enabled: search.length > 0,
      refetchOnWindowFocus: false,
    },
  );

  const toolSearch = api.tools.search.useQuery(
    {
      query: search,
    },
    {
      enabled: search.length > 2,
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    if (search.length > 0) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [search]);
  return (
    <div className="relative flex w-full">
      <div className="flex w-full flex-col gap-4">
        <Input
          className="h-12 w-full px-4"
          value={search}
          //on press enter
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setShowResults(false);
              setQuery(search);
              setPage(1);
            }
          }}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />

        <SelectedTags />
      </div>

      <div
        className={cn(
          "absolute left-0 top-14 z-10 max-h-[300px] min-h-10 w-full overflow-y-scroll rounded-md border border-border bg-background shadow-md transition-all duration-300 scrollbar scrollbar-track-background scrollbar-thumb-background hover:scrollbar-thumb-primary",
          showResults
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0",
        )}
      >
        {toolSearch.data && toolSearch.data?.tools.length > 0 && (
          <>
            <div className="sticky left-0 top-0 border-b border-border bg-accent p-2 text-sm">
              Tools
            </div>
            {toolSearch.data?.tools.map((tool) => (
              <div
                onClick={() => {
                  setSearch("");
                  setQuery(tool.name);
                }}
                key={tool.name}
                className="m-1 flex cursor-pointer items-center justify-between rounded-sm p-2 hover:bg-primary/10"
              >
                <span className="capitalize">{tool.name}</span>
              </div>
            ))}
          </>
        )}

        {tagSearch.data && tagSearch.data?.tags.length > 0 && (
          <>
            <div className="sticky left-0 top-0 border-b border-border bg-accent p-2 text-sm">
              Tags
            </div>
            {tagSearch.data?.tags.map((tag) => (
              <div
                onClick={() => {
                  setSearch("");
                  setTags([tag.name]);
                }}
                key={tag.name}
                className="m-1 flex cursor-pointer items-center justify-between rounded-sm p-2 hover:bg-primary/10"
              >
                <span className="capitalize">{tag.name}</span>
                <span className="text-sm text-muted-foreground">
                  {millify(tag.uses)}
                </span>
              </div>
            ))}
          </>
        )}

        {tagSearch.isPending && (
          <div className="flex h-full w-full items-center justify-center p-6">
            <Loader2 className="size-4 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}

export function SelectedTags() {
  const router = useRouter();
  const [tags, setTags] = useQueryState("tags", {
    shallow: false,
    parse: (v) => v.split(",").filter((v) => v.length > 0),
  });
  return (
    <div className="flex flex-wrap gap-4">
      {tags && tags.length > 0 && (
        <div className="flex gap-2">
          {tags.map((tag) => (
            <Badge
              className="cursor-pointer"
              key={tag}
              onClick={() => {
                if (tags.length === 1) {
                  router.push("/search");
                }
                setTags(tags.filter((t) => t !== tag));
              }}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptySearchPage(props: { tags?: Tag[] }) {
  const [tags, setTags] = useQueryState("tags", {
    shallow: false,
    parse: (v) => v.split(","),
  });

  return (
    <div className="flex h-full w-full max-w-3xl flex-1 flex-grow flex-col justify-center gap-6 px-6">
      <span className="text-3xl">{`There's an AI for that.`}</span>

      <div className="flex w-full gap-6">
        <SearchBox />

        <Button className="flex h-12 w-12">
          <Search />
        </Button>
      </div>

      <div className="flex w-full flex-wrap gap-4">
        {props.tags?.map((tag) => (
          <Badge
            onClick={() => {
              setTags([tag.name]);
            }}
            key={tag.name}
            className="flex cursor-pointer capitalize"
          >
            {tag.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
