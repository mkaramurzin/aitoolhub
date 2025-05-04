"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { useAreYouSure } from "@/hooks/use-are-you-sure";
import { usePagination } from "@/hooks/use-pagination";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import { Ellipsis, Loader2, Send, Trash2 } from "lucide-react";
import { useQueryState } from "nuqs";
import { useState } from "react";
export type TechCrunchClientPageProps = {};

export function TechCrunchClientPage(props: TechCrunchClientPageProps) {
  const [page, setPage] = useQueryState("page", {
    shallow: false,
    history: "push",
    parse: (v) => parseInt(v),
  });

  const { AreYouSure, setShowAreYouSure, setObject, object } = useAreYouSure<{
    id?: string;
  }>({});

  const [pageSize, setPageSize] = useState<number>(10); // Default page size
  const [pageSizeLabel, setPageSizeLabel] = useState<string>("Page Size");

  const techCrunchQuery = api.techCrunch.fetchAll.useQuery({
    page: page || 1,
    take: pageSize,
  });

  const generate = api.techCrunch.generate.useMutation({
    onSuccess: () => {
      techCrunchQuery.refetch();
    },
  });

  const deleteMutation = api.techCrunch.delete.useMutation({
    onSuccess: () => {
      techCrunchQuery.refetch();
    },
  });

  const totalCount = techCrunchQuery.data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: page ?? 1,
    totalPages,
    paginationItemsToDisplay: 5,
  });

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
      <AreYouSure
        title="Are you sure?"
        description="This action cannot be undone."
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          if (!object || !object.id) return;
          deleteMutation.mutate({ id: object.id });
          setShowAreYouSure(false);
        }}
        onCancel={async () => setShowAreYouSure(false)}
      />
      <div className="w-full">
        <div className="flex items-center justify-between">
          <h1 className="mb-4 text-2xl font-bold">Tech Crunch</h1>

          <div className="flex space-x-4">
            <Button
              disabled={generate.isPending}
              onClick={() => {
                generate.mutate();
              }}
              className="flex gap-2"
            >
              <span
                className={cn(generate.isPending ? "opacity-0" : "opacity-100")}
              >
                Generate
              </span>

              {generate.isPending && (
                <Loader2 className="absolute size-4 animate-spin" />
              )}
            </Button>

            <a className={buttonVariants()} href="/tech-crunch/new">
              + New Tech Crunch
            </a>

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
              <TableHead className="w-[200px]">Title</TableHead>
              <TableHead>Sponsors</TableHead>
              <TableHead>Summaries</TableHead>
              <TableHead>Tools</TableHead>
              <TableHead>Tweets</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {techCrunchQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : techCrunchQuery.data?.techCrunchItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  No tech crunch items found.
                </TableCell>
              </TableRow>
            ) : (
              techCrunchQuery.data?.techCrunchItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <a href={`/tech-crunch/${item.id}/update`}>{item.title}</a>
                  </TableCell>
                  <TableCell>
                    {item.TechCrunchSponsor.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {item.TechCrunchSponsor.map((sponsor) => (
                          <span
                            key={sponsor.id}
                            className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground"
                          >
                            {sponsor.Tool.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="italic text-muted-foreground">
                        No sponsors
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.TechCrunchSummary.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {item.TechCrunchSummary.length}
                      </div>
                    ) : (
                      <span className="italic text-muted-foreground">
                        No summaries
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.TechCrunchTool.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {item.TechCrunchTool.map((tool) => (
                          <span
                            key={tool.id}
                            className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground"
                          >
                            {tool.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="italic text-muted-foreground">
                        No tools
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.TechCrunchIngestXData.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {item.TechCrunchIngestXData.length}
                      </div>
                    ) : (
                      <span className="italic text-muted-foreground">
                        No tweets
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`rounded-md px-2 py-1 text-xs ${
                        item.status === "PUBLISHED"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {item.status || "DRAFT"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {format(new Date(item.createdAt), "MMM d, yyyy h:mm a")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Ellipsis className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="flex gap-2"
                          onClick={() => {
                            setShowAreYouSure(true);
                            setObject({ id: item.id });
                          }}
                        >
                          <Trash2 className="size-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex gap-2">
                          <Send className="size-4" />
                          <span>Send</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

export default TechCrunchClientPage;
