"use client";

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

const PAGE_SIZE = 10;

export type SearchesClientPageProps = {};

export function SearchesClientPage(props: SearchesClientPageProps) {
  const [page, setPage] = useQueryState("page", {
    shallow: false,
    history: "push",
    parse: (v) => parseInt(v),
  });

  const searchesQuery = api.tools.searchHistory.fetchAll.useQuery({
    page: page || 1,
    take: PAGE_SIZE,
  });

  const totalCount = searchesQuery.data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: page ?? 1,
    totalPages,
    paginationItemsToDisplay: 5,
  });

  return (
    <div className="flex min-h-dvh w-full flex-col items-center space-y-6 p-6">
      <div className="w-full">
        <h1 className="mb-4 text-2xl font-bold">Search History</h1>

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
