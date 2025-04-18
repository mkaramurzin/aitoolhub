"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PaginationBar } from "@/components/ui/pagination-bar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePagination } from "@/hooks/use-pagination";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import { useQueryState } from "nuqs";
import * as React from "react";

const PAGE_SIZE = 10;

export type SearchesClientPageProps = {};

export function SearchesClientPage(props: SearchesClientPageProps) {
  const [page, setPage] = useQueryState("page", {
    shallow: false,
    history: "push",
    parse: (v) => parseInt(v),
  });

  const [refreshInterval, setRefreshInterval] = React.useState<number>(5000); // Default refresh interval
  const [refreshLabel, setRefreshLabel] =
    React.useState<string>("Refresh Speed");
  const [pageSize, setPageSize] = React.useState<number>(10); // Default page size
  const [pageSizeLabel, setPageSizeLabel] = React.useState<string>("Page Size");

  const searchesQuery = api.tools.searchHistory.fetchAll.useQuery(
    {
      page: page || 1,
      take: pageSize,
    },
    {
      refetchInterval: refreshInterval,
    },
  );

  const totalCount = searchesQuery.data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: page ?? 1,
    totalPages,
    paginationItemsToDisplay: 5,
  });

  const handleRefreshIntervalChange = (interval: number) => {
    setRefreshInterval(interval);
    const labelMap: Record<number, string> = {
      1000: "1 Second",
      5000: "5 Seconds",
      10000: "10 Seconds",
      30000: "30 Seconds",
    };
    setRefreshLabel(labelMap[interval] || "Refresh Speed");
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    const labelMap: Record<number, string> = {
      10: "10 Items",
      20: "20 Items",
      50: "50 Items",
      100: "100 Items",
    };
    setPageSizeLabel(labelMap[size] || "Page Size");
  };

  return (
    <div className="flex min-h-dvh w-full flex-col items-center space-y-6 p-6">
      <div className="w-full">
        <div className="flex items-center justify-between">
          <h1 className="mb-4 text-2xl font-bold">Search History</h1>

          <div className="flex space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">{refreshLabel}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Set Refresh Speed</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={refreshInterval.toString()}
                  onValueChange={(value) =>
                    handleRefreshIntervalChange(Number(value))
                  }
                >
                  <DropdownMenuRadioItem value="1000">
                    1 Second
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="5000">
                    5 Seconds
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="10000">
                    10 Seconds
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="30000">
                    30 Seconds
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">{pageSizeLabel}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Set Page Size</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={pageSize.toString()}
                  onValueChange={(value) => handlePageSizeChange(Number(value))}
                >
                  <DropdownMenuRadioItem value="10">
                    10 Items
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="20">
                    20 Items
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="50">
                    50 Items
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="100">
                    100 Items
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Query</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Pricing Filter</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {searchesQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : searchesQuery.data?.searches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center">
                  No searches found.
                </TableCell>
              </TableRow>
            ) : (
              searchesQuery.data?.searches.map((search) => (
                <TableRow key={search.id}>
                  <TableCell className="font-medium">
                    {search.query || (
                      <span className="italic text-muted-foreground">
                        No query
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {search.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {search.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="italic text-muted-foreground">
                        No tags
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {search.pricing ? (
                      <span className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                        {search.pricing}
                      </span>
                    ) : (
                      <span className="italic text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {search.User ? (
                      <div className="flex items-center gap-2">
                        {search.User.image && (
                          <img
                            src={search.User.image}
                            alt={`${search.User.name}'s avatar`}
                            className="h-6 w-6 rounded-full"
                          />
                        )}
                        <span>{search.User.name}</span>
                      </div>
                    ) : (
                      <span className="italic text-muted-foreground">
                        Anonymous
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(search.createdAt), "MMM d, yyyy h:mm a")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="mt-6">
          <PaginationBar
            page={page ?? 1}
            totalPages={totalPages}
            pages={pages}
            showLeftEllipsis={showLeftEllipsis}
            showRightEllipsis={showRightEllipsis}
            setPage={setPage}
          />
        </div>
      </div>
    </div>
  );
}

export default SearchesClientPage;
