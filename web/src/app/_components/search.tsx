import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { usePagination } from "@/hooks/use-pagination";
import { cn } from "@/lib/utils";
import { useFilterDrawer } from "@/store/useFilterDrawer";
import { api } from "@/trpc/react";
import { Tag } from "@prisma/client";
import { Filter, Loader2, Mail, Search, Star, TrendingUp } from "lucide-react";
import millify from "millify";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { SubscribeEmailCapture } from "./subscribe-email-capture";
import ToolCard from "./tool-card";
export type SearchPageProps = {
  tags?: Tag[];
  orderBy?: "trending" | "new";
};

export function SearchPage(props: SearchPageProps) {
  const [tags, setTags] = useQueryState("tags", {
    shallow: false,
    parse: (v) => v.split(","),
  });

  const [query, setQuery] = useQueryState("query", { shallow: false });

  return (
    <div className="flex w-full flex-col items-center py-10">
      {(!tags || tags.length < 1) && !query && !props.orderBy ? (
        <EmptySearchPage tags={props.tags} />
      ) : (
        <SearchResultsPage orderBy={props.orderBy} />
      )}
    </div>
  );
}

export function SearchResultsPage({
  showSearch = true,
  orderBy,
}: {
  showSearch?: boolean;
  orderBy?: "trending" | "new";
}) {
  const PAGE_SIZE = 18;
  // Query states for tags, query string, and page number
  const [tags, setTags] = useQueryState("tags", {
    shallow: false,
    history: "push",
    parse: (v) => v.split(",").filter((v) => v.length > 0),
  });
  const [query, setQuery] = useQueryState("query", { shallow: false });
  const [page, setPage] = useQueryState("page", {
    shallow: false,
    history: "push",
    parse: (v) => parseInt(v),
  });
  const [pricing, setPricing] = useQueryState("pricing", {
    shallow: false,
    history: "push",
    parse: (v) => (["free", "paid", "free-paid"].includes(v) ? v : undefined),
  });

  // Call the API with page number, query and tags
  const toolsQuery = api.tools.fetchAll.useQuery({
    page: page ?? 1,
    query: query ?? undefined,
    tags: tags ?? undefined,
    pricing: pricing ?? undefined,
    orderBy,
    take: PAGE_SIZE,
  });

  const totalCount = toolsQuery.data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: page ?? 1,
    totalPages,
    paginationItemsToDisplay: 5,
  });

  return (
    <div className="flex w-full max-w-5xl flex-col items-center">
      {showSearch && (
        <>
          <div className="mb-6 flex w-full max-w-3xl flex-col gap-6 px-4">
            <SearchBox />
          </div>
          <SearchOptions />
          <div className="my-4"></div>
        </>
      )}

      {toolsQuery.data && toolsQuery.data.tools.length > 0 ? (
        <>
          <div className="flex w-full flex-col items-center px-4">
            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {toolsQuery.data.tools.map((tool) => (
                <ToolCard
                  href={`/tools/${tool.id}`}
                  tool={tool}
                  key={tool.id}
                  tags={tool.ToolTags.flatMap((tag) => tag.Tag)}
                />
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
  const { setOpen: setFilterDrawerOpen } = useFilterDrawer();
  const [tags, setTags] = useQueryState("tags", {
    shallow: false,
    history: "push",
    parse: (v) => v.split(",").filter((v) => v.length > 0),
  });
  const [page, setPage] = useQueryState("page", {
    shallow: false,
    history: "push",
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
    <div className="relative flex w-full items-center">
      <div className="relative flex w-full flex-col items-center">
        <Input
          className="h-12 w-full rounded-full pl-12 pr-4"
          placeholder={`Search AI tools...`}
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

        <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
          <Search className="h-5 w-5" />
        </div>
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
              Categories
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

      {/* Filter */}
      <Button
        onClick={() => {
          setFilterDrawerOpen(true);
        }}
        variant={"secondary"}
        size="lg"
        className="ml-4 flex h-12 w-12 p-0"
      >
        <Filter />
      </Button>
    </div>
  );
}

function SearchOptions() {
  const [page, setPage] = useQueryState("page", {
    shallow: false,
    history: "push",
    parse: (v) => parseInt(v),
  });
  const [orderBy, setOrderBy] = useQueryState("orderBy", {
    shallow: false,
    history: "push",
  });
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {[
        {
          id: "new",
          icon: {
            component: Star,
            className: "text-yellow-500 ",
          },
          text: "New Tools",
          onClick: () => {
            setPage(1);
            setOrderBy("new");
          },
        },
        {
          id: "trending",
          icon: {
            component: TrendingUp,
            className: "text-emerald-500 fill-emerald-500",
          },
          text: "Trending",
          onClick: () => {
            setPage(1);
            setOrderBy("trending");
          },
        },
        // {
        //   icon: {
        //     component: Heart,
        //     className: "text-red-500",
        //   },
        //   text: "Our Picks",
        // },
        {
          id: "subscribe",
          icon: {
            component: Mail,
            className: "text-blue-500",
          },
          text: "Subscribe",
          onClick: () => {},
        },
      ].map((item) => {
        const tagButton = (
          <Badge
            variant={"secondary"}
            className={cn(
              "secondary flex cursor-pointer gap-2 rounded-full px-3 py-1",
            )}
            key={item.id}
            onClick={item.onClick}
          >
            <item.icon.component
              className={cn("size-5", item.icon.className)}
            />
            <span
              className={cn(
                "text-lg font-normal",
                item.id === orderBy && "text-white",
              )}
            >
              {item.text}
            </span>
          </Badge>
        );
        if (item.id === "subscribe") {
          return (
            <Dialog key={item.id}>
              <DialogTrigger asChild>{tagButton}</DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <SubscribeEmailCapture />
              </DialogContent>
            </Dialog>
          );
        }
        return tagButton;
      })}
    </div>
  );
}

export function SelectedTags() {
  const router = useRouter();
  const [tags, setTags] = useQueryState("tags", {
    shallow: false,
    history: "push",
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
  const defaultToolsQuery = api.tools.defaultTools.useQuery();

  return (
    <div className="flex h-full w-full flex-1 flex-grow flex-col items-center justify-center gap-6 px-6">
      <span className="w-full max-w-3xl text-3xl">{`There's an AI for that.`}</span>

      <div className="flex w-full max-w-3xl gap-6">
        <SearchBox />
      </div>
      <SearchOptions />

      <div className="flex w-full max-w-5xl flex-col gap-4 md:flex-row">
        {/* new */}
        <div className="flex w-full flex-col md:w-1/2 lg:w-2/3">
          <span className="mb-4 flex items-center gap-2 text-xl">
            <Star className="size-5 text-yellow-500" />
            New Tools
          </span>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {defaultToolsQuery.data?.newTools.map((tool) => (
              <ToolCard
                href={`/tools/${tool.id}`}
                tool={tool}
                key={tool.id}
                tags={tool.ToolTags.flatMap((tag) => tag.Tag)}
              />
            ))}
          </div>
        </div>

        {/* trending */}
        <div className="flex w-full flex-col md:w-1/2 lg:w-1/3">
          <span className="mb-4 flex items-center gap-2 self-end text-xl">
            <TrendingUp className="size-5 fill-emerald-500 text-emerald-500" />
            Trending Tools
          </span>

          <div className="grid grid-cols-1 gap-4">
            {defaultToolsQuery.data?.trendingTools.map((tool) => (
              <ToolCard
                href={`/tools/${tool.id}`}
                tool={tool}
                key={tool.id}
                tags={tool.ToolTags.flatMap((tag) => tag.Tag)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
