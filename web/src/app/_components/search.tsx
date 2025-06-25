import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaginationBar } from "@/components/ui/pagination-bar";
import FilterDrawer from "@/components/ui/sidebar/filters-side-bar";
import { usePagination } from "@/hooks/use-pagination";
import { api } from "@/trpc/react";
import { Tag } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { SearchBox } from "../(app)/search/_components/search-box";
import { SearchHomePage } from "../(app)/search/_components/search-home";
import { SearchOptions } from "../(app)/search/_components/search-options";
import { SearchTitle } from "../(app)/search/_components/search-title";
import ToolCard from "./tool-card";

export type SearchPageProps = {
  tags?: Tag[];
  orderBy?: "trending" | "new";
};

export function SearchPage(props: SearchPageProps) {
  const [tags, setTags] = useQueryState("tags", {
    shallow: false,
    parse: (v) => v.split(",").filter((v) => v.length > 0),
  });

  const [query, setQuery] = useQueryState("query", { shallow: false });

  return (
    <div className="flex w-full flex-col items-center py-10">
      {(!tags || tags.length < 1) && !query && !props.orderBy ? (
        <SearchHomePage tags={props.tags} />
      ) : (
        <SearchResultsPage orderBy={props.orderBy} />
      )}

      <FilterDrawer />
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

  const skipClarifyRef = useRef(false);
  const [clarifyDone, setClarifyDone] = useState(!query);
  const [clarifyQuestion, setClarifyQuestion] = useState<string | null>(null);
  const [clarifyAnswer, setClarifyAnswer] = useState("");
  const [originalQuery, setOriginalQuery] = useState<string | undefined>(undefined);

  const clarifyQuery = api.tools.clarifySearch.useQuery(
    { query: query ?? "" },
    {
      enabled: !!query && !clarifyDone,
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    if (clarifyQuery.data) {
      if ("question" in clarifyQuery.data && clarifyQuery.data.question) {
        setClarifyQuestion(clarifyQuery.data.question);
      } else {
        setClarifyDone(true);
      }
    }
  }, [clarifyQuery.data]);

  useEffect(() => {
    if (skipClarifyRef.current) {
      skipClarifyRef.current = false;
      return;
    }
    setClarifyDone(!query);
    setOriginalQuery(undefined);
    setClarifyQuestion(null);
    setClarifyAnswer("");
  }, [query]);

  const toolSkeletons = Array.from({ length: 20 }, (_, i) => (
    <ToolCard.Skeleton key={i} />
  ));

  // Call the API with page number, query and tags
  const toolsQuery = api.tools.fetchAll.useQuery(
    {
      page: page ?? 1,
      query: query ?? undefined,
      originalQuery,
      tags: tags ?? undefined,
      pricing: pricing ?? undefined,
      orderBy,
      take: PAGE_SIZE,
      magicSearch: query ? query.length > 0 : false,
    },
    {
      refetchOnWindowFocus: false,
      enabled: clarifyDone,
    },
  );

  const totalCount = toolsQuery.data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: page ?? 1,
    totalPages,
    paginationItemsToDisplay: 5,
  });

  return (
    <div className="flex w-full max-w-6xl flex-col items-center">
      {showSearch && (
        <>
          <SearchTitle />
          <div className="my-3"></div>
          <div className="mb-6 flex w-full max-w-xl flex-col gap-6 px-4">
            <SearchBox />
          </div>
          <SearchOptions />
          <div className="my-4"></div>
          {clarifyQuestion && (
            <div className="mb-4 flex w-full max-w-xl flex-col items-center gap-2 px-4">
              <p className="text-center">{clarifyQuestion}</p>
              <div className="flex w-full items-center gap-2">
                <Input
                  value={clarifyAnswer}
                  onChange={(e) => setClarifyAnswer(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => {
                    const newQuery = `${query ?? ""} ${clarifyAnswer}`.trim();
                    skipClarifyRef.current = true;
                    setOriginalQuery(query ?? undefined);
                    setQuery(newQuery);
                    setClarifyDone(true);
                    setClarifyQuestion(null);
                    setClarifyAnswer("");
                  }}
                >
                  Submit
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {toolsQuery.data && toolsQuery.data.tools.length > 0 ? (
        <>
          <div className="flex w-full flex-col items-center px-4">
            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {toolsQuery.data.tools.map((tool) => (
                <ToolCard
                  href={`/tools/${tool.slug}`}
                  tool={tool}
                  key={tool.id}
                  tags={tool.ToolTags.flatMap((tag) => tag.Tag)}
                  analytics={tool.ToolAnalytics}
                  isFavorite={tool.UserToolFavorite.length > 0}
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
