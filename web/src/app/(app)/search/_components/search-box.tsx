import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useFilterDrawer } from "@/store/useFilterDrawer";
import { Filter, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
const placeholders = [
  "Build a website",
  "Automate my accounting",
  "Design 3D models",
];
export function SearchBox() {
  const [search, setSearch] = useState("");
  const { setOpen: setFilterDrawerOpen, open: filterDrawerOpen } =
    useFilterDrawer();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

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
  const [query, setQuery] = useQueryState("query", {
    shallow: true,
    defaultValue: "",
  });
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setPlaceholderIndex((current) => (current + 1) % placeholders.length);
        setIsTransitioning(false);
      }, 150);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (search.length > 0) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [search]);

  useEffect(() => {
    if (query) {
      setSearch(query);
    }
  }, [query]);

  return (
    <div className="relative flex w-full items-center">
      <div className="relative flex w-full flex-col items-center">
        <div
          className={cn(
            "group relative w-full transition-all duration-300",
            search.length > 0 && "glow-box",
          )}
        >
          {/* <div className="absolute -inset-px hidden rounded-md bg-primary opacity-20 blur-md transition-all duration-1000 group-hover:-inset-1 group-hover:opacity-40 group-hover:duration-200"></div> */}
          <Input
            className="relative h-12 w-full border-none bg-secondary pl-4 pr-4 outline-none focus-visible:ring-0"
            value={search}
            maxLength={100}
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
          <div
            className={`pointer-events-none absolute left-0 top-0 flex h-full w-full items-center px-5 text-gray-500 ${search.length > 0 ? "hidden" : "block"}`}
          >
            <span
              className={`transition-all duration-150 ${isTransitioning ? "translate-y-[-40%] opacity-0" : "translate-y-0 opacity-100"}`}
            >
              {placeholders[placeholderIndex]}
            </span>
          </div>
        </div>
      </div>

      {/* Search */}
      <Button
        onClick={() => {
          setQuery(search);
          setPage(1);
        }}
        variant={"secondary"}
        size="lg"
        className="ml-4 flex h-12 w-14 p-0"
      >
        <Search />
      </Button>

      {/* Filter */}
      <Button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (filterDrawerOpen) return;
          setFilterDrawerOpen(true);
        }}
        variant={"secondary"}
        size="lg"
        className="relative ml-4 flex h-12 w-14 p-0"
      >
        {/* if has filter show bubble */}
        {tags && tags.length > 0 && (
          <span className="absolute -right-2 -top-2 size-5 rounded-full bg-primary px-1">
            {tags.length}
          </span>
        )}
        <Filter />
      </Button>
    </div>
  );
}
