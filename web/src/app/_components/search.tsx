import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaginationBar } from "@/components/ui/pagination-bar";
import FilterDrawer from "@/components/ui/sidebar/filters-side-bar";
import { usePagination } from "@/hooks/use-pagination";
import { useSearch } from "@/hooks/use-search";
import { api } from "@/trpc/react";
import { Tag } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState, useCallback } from "react";
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
  const { query } = useSearch();
  const [tags, setTags] = useQueryState("tags", {
    shallow: false,
    parse: (v) => v.split(",").filter((v) => v.length > 0),
  });

  const showHomePage = (!tags || tags.length < 1) && !query && !props.orderBy;

  return (
    <div className="flex w-full flex-col items-center py-10">
      {showHomePage ? (
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
  
  // Use custom search hook for better state management
  const { query, setQuery, debouncedQuery, isSearching, hasQuery } = useSearch();
  
  // Add state for conversation refinements that don't immediately update URL
  const [conversationQuery, setConversationQuery] = useState<string>('');
  const [shouldPreserveChat, setShouldPreserveChat] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Query states for filters and pagination
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
  const [pricing, setPricing] = useQueryState("pricing", {
    shallow: false,
    history: "push",
    parse: (v) => (["free", "paid", "free-paid"].includes(v) ? v : undefined),
  });

  // Reset page when search parameters change
  useEffect(() => {
    if (page && page > 1) {
      setPage(1);
    }
  }, [query, tags, pricing, setPage]);

  // Initialize conversation query when main query changes (but not from conversation)
  useEffect(() => {
    if (!shouldPreserveChat && debouncedQuery) {
      setConversationQuery(debouncedQuery);
    }
  }, [debouncedQuery, shouldPreserveChat]);

  const toolSkeletons = Array.from({ length: PAGE_SIZE }, (_, i) => (
    <ToolCard.Skeleton key={i} />
  ));

  // Use conversation query for API calls when available, fall back to debounced query  
  const effectiveQuery = conversationQuery || debouncedQuery;

  // Call the API with page number, query and tags
  const toolsQuery = api.tools.fetchAll.useQuery(
    {
      page: page ?? 1,
      query: effectiveQuery ?? undefined,
      tags: tags ?? undefined,
      pricing: pricing ?? undefined,
      orderBy,
      take: PAGE_SIZE,
      magicSearch: !!effectiveQuery, // Use the effective query condition
      searchHistory: true,
    },
    {
      refetchOnWindowFocus: false,
      enabled: true, // Always enabled, no blocking clarification
    },
  );

  const totalCount = toolsQuery.data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: page ?? 1,
    totalPages,
    paginationItemsToDisplay: 5,
  });

  const isLoading = toolsQuery.isPending || isSearching;
  const hasResults = toolsQuery.data && toolsQuery.data.tools.length > 0;

  // Handle conversation-driven search refinement
  const handleConversationRefine = useCallback((refinedQuery: string) => {
    setShouldPreserveChat(true);
    setConversationQuery(refinedQuery);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Debounce URL update to prevent chat destruction
    timeoutRef.current = setTimeout(() => {
      setQuery(refinedQuery);
      setShouldPreserveChat(false);
      timeoutRef.current = null;
    }, 1000);
  }, [setQuery]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex w-full max-w-6xl flex-col items-center">
      {showSearch && (
        <>
          <SearchTitle />
          <div className="my-3"></div>
          <div className="mb-6 flex w-full max-w-xl flex-col gap-6 px-4">
            <SearchBox 
              conversationResponse={toolsQuery.data?.conversationResponse || toolsQuery.data?.clarificationSuggestion || undefined}
              suggestedRefinements={toolsQuery.data?.conversationRefinements || toolsQuery.data?.clarificationTags || []}
              confidence={toolsQuery.data?.confidence || 0}
              onRefine={handleConversationRefine}
              currentQuery={conversationQuery || effectiveQuery || ''}
              toolCount={totalCount}
            />
          </div>
          <SearchOptions />
          <div className="my-4"></div>
        </>
      )}

      {/* Search status indicator */}
      {isSearching && (
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
          Searching...
        </div>
      )}

      {hasResults ? (
        <>
          {/* Results count */}
          <div className="mb-4 w-full px-4 text-sm text-muted-foreground">
            {totalCount} {totalCount === 1 ? 'tool' : 'tools'} found
            {effectiveQuery && (
              <span> for "{effectiveQuery}"</span>
            )}
          </div>
          
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
          {totalPages > 1 && (
            <PaginationBar
              page={page ?? 1}
              totalPages={totalPages}
              pages={pages}
              showLeftEllipsis={showLeftEllipsis}
              showRightEllipsis={showRightEllipsis}
              setPage={setPage}
            />
          )}
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center py-12">
          {isLoading ? (
            <div className="flex w-full flex-col items-center px-4">
              <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {toolSkeletons}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <span className="text-3xl text-muted-foreground">No tools found</span>
              {(effectiveQuery || tags?.length || pricing) && (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Try adjusting your search criteria:</p>
                  <ul className="space-y-1">
                    {effectiveQuery && <li>• Try different keywords</li>}
                    {tags?.length && <li>• Remove some tag filters</li>}
                    {pricing && <li>• Change pricing filter</li>}
                  </ul>
                </div>
              )}
            </div>
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
  )
} 