"use client";
import { cn } from "@/lib/utils";
import { useFilterDrawer } from "@/store/useFilterDrawer";
import { api } from "@/trpc/react";
import { Loader2, RefreshCw, X } from "lucide-react";
import millify from "millify";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { Badge } from "../badge";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import { RadioGroup, RadioGroupItem } from "../radio-group";

function mergeRefs(...refs: any[]) {
  return (node: any) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    });
  };
}

export type FilterDrawerProps = {};

function FilterDrawer({}: React.PropsWithChildren<FilterDrawerProps>) {
  const { open, setOpen } = useFilterDrawer();
  const drawerRef = useRef<HTMLDivElement>(null);
  const [tags, setTags] = useQueryState("tags", {
    shallow: false,
    history: "push",
    defaultValue: [],
    parse: (v) => v.split(",").filter((v) => v.length > 0),
  });
  const [pricing, setPricing] = useQueryState("pricing", {
    shallow: false,
    history: "push",
    defaultValue: "",
  });
  const [page, setPage] = useQueryState("page", {
    shallow: false,
    history: "push",
    parse: (v) => parseInt(v),
  });
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node) &&
        open
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, setOpen]);

  const [tagSearch, setTagSearch] = useState("");
  const tagSearchQuery = api.tags.search.useQuery(
    {
      query: tagSearch,
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  function addTag(tag: string) {
    // check if tag already exists
    if (tags.includes(tag)) return;

    setTags([...tags, tag]);
  }

  // Configure swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedRight: (eventData) => {
      // Adjust threshold if necessary
      if (eventData.deltaX > 50) {
        setOpen(false);
      }
    },
    trackTouch: true,
    trackMouse: false,
  });

  // Destructure the swipeHandlers to separate the ref
  const { ref: swipeRef, ...swipeHandlersWithoutRef } = swipeHandlers;

  // Merge both refs: your drawerRef and the swipeRef
  const combinedRef = mergeRefs(drawerRef, swipeRef);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-10 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}
      <div
        ref={combinedRef}
        {...swipeHandlersWithoutRef}
        className={cn(
          "fixed top-0 z-20 h-dvh w-[300px] min-w-[300px] overflow-y-auto border border-b-0 border-l border-t-0 border-border bg-background duration-300 ease-in-out scrollbar scrollbar-track-background scrollbar-thumb-primary",
          open ? "right-0" : "right-[-300px]",
        )}
      >
        <div className="sticky top-0 flex h-16 w-full items-center justify-between border-b border-border bg-background px-4">
          <span className="text-lg font-semibold">Filters</span>
          {(tags.length > 0 || pricing !== "") && (
            <Button
              variant={"ghost"}
              onClick={() => {
                setPage(1);
                setTags([]);
                setPricing("");
              }}
              title="Clear all filters"
              aria-label="Clear all filters"
              className="text-primary"
            >
              <span>Reset all Filters</span>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}

          <Button
            size="icon"
            variant={"ghost"}
              onClick={() => {
                setOpen(false);
              }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Categories */}
        <div className="flex items-center justify-between bg-primary/5 p-4">
          <span className="">Categories</span>
          {tags.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPage(1);
                setTags([]);
              }}
              title="Reset categories"
              aria-label="Reset categories"
              className="size-6 px-2 text-primary"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        <div className="flex w-full flex-col space-y-2 rounded-md p-4">
          {tags.length > 0 && (
            <>
              <div className="flex flex-wrap gap-4">
                {tags.map((s, i) => {
                  return (
                    <Badge
                      key={s + i}
                      onClick={() => {
                        setPage(1)
                        if (tags.includes(s)) {
                          const newTags = tags.filter((t) => t !== s);
                          setTags(newTags);
                        } else {
                          addTag(s);
                        }
                      }}
                      variant={tags.includes(s) ? "default" : "secondary"}
                      className={cn("cursor-pointer")}
                    >
                      {s}
                    </Badge>
                  );
                })}
              </div>
            </>
          )}
          <div className="flex w-full flex-col gap-4">
            <Input
              className="h-12 w-full px-4"
              value={tagSearch}
              placeholder="Search for categories"
              onChange={(e) => {
                setTagSearch(e.target.value);
              }}
            />
          </div>

          <div className="flex w-full flex-col space-y-0">
            {tagSearchQuery.data && tagSearchQuery.data?.tags.length > 0 && (
              <>
                {tagSearchQuery.data?.tags.map((tag) => (
                  <div
                    onClick={() => {
                      setPage(1);
                      setTagSearch("");
                      addTag(tag.name);
                    }}
                    key={tag.name}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-2 rounded-sm p-2 hover:bg-primary/10",
                      tags.includes(tag.name) &&
                        "cursor-not-allowed bg-primary/5 text-muted-foreground",
                    )}
                  >
                    <span className="line-clamp-1 capitalize">{tag.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {millify(tag.uses)}
                    </span>
                  </div>
                ))}
              </>
            )}

            {tagSearchQuery.isPending && tagSearch.length > 0 && (
              <div className="flex h-full w-full items-center justify-center p-6">
                <Loader2 className="size-4 animate-spin" />
              </div>
            )}

            {!tagSearchQuery.isPending &&
              tagSearch.length > 0 &&
              tagSearchQuery.data?.tags.length === 0 && (
                <div className="flex h-full w-full items-center justify-center p-6">
                  <span className="text-sm text-muted-foreground">
                    No categories found
                  </span>
                </div>
              )}
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between bg-primary/5 p-4">
          <span className="">Pricing</span>
          {pricing !== "" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPage(1);
                setPricing("");
              }}
              title="Reset pricing"
              aria-label="Reset pricing"
              className="size-6 px-2 text-primary"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        <div className="sprounded-md flex w-full flex-col p-4">
          <RadioGroup
            className="flex w-full flex-col space-y-1"
            value={pricing}
            onValueChange={(value) => {
              // Normal selection: set the selected pricing value
              if (pricing !== value) {
                setPricing(value);
              }
            }}
          >
            {[
              { name: "Free", value: "free" },
              { name: "Free and Paid", value: "free-paid" },
              { name: "Paid", value: "paid" },
            ].map((s) => (
              <div
                key={s.value}
                onClick={() => {
                  setPage(1);
                  if (pricing === s.value) {
                    setPricing("");
                  }
                }}
                className="flex cursor-default items-center space-x-2"
              >
                <RadioGroupItem value={s.value} id={`pricing-${s.value}`} />
                <Label htmlFor={`pricing-${s.value}`}>{s.name}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </>
  );
}
export default FilterDrawer;
