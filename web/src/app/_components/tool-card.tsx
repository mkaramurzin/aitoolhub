import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { Tag, Tool, ToolAnalytics } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { Bookmark, Eye, Star } from "lucide-react";
import millify from "millify";
import { useQueryState } from "nuqs";
import { useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";

function ToolCard({
  tool,
  tags,
  href,
  analytics,
}: {
  tool: Tool;
  tags: Tag[];
  href: string;
  analytics?: ToolAnalytics | null;
}) {
  const [filterTags, setFilterTags] = useQueryState("tags", {
    shallow: false,
    history: "push",
    parse: (v) => v.split(",").filter((v) => v.length > 0),
  });
  const [page, setPage] = useQueryState("page", {
    shallow: false,
    history: "push",
    parse: (v) => parseInt(v),
  });

  const addToFavoritesMutation = api.tools.favorites.upsert.useMutation({
    onSuccess: () => {
      toast("Saved to favorites");
    },
    onError: () => {
      toast.error("Please login to save to favorites.", {
        action: {
          label: (
            <span>
              <span>Login with Google</span>
            </span>
          ),
          onClick: () => {
            authClient.signIn.social({
              provider: "google",
              callbackURL: window.location.href,
            });
          },
        },
      });
    },
  });
  return (
    <a
      href={href}
      key={tool.id}
      className="flex w-full flex-col rounded-md border border-border bg-card p-4"
    >
      {/* Image and name */}
      <div className="mb-4 flex gap-4">
        {tool.image && tool.image.length > 0 ? (
          <img
            src={tool.image}
            alt={tool.name}
            className="size-16 rounded-md"
          />
        ) : (
          <div className="h-16 min-h-16 w-16 min-w-16 rounded-md bg-secondary"></div>
        )}
        <div className="flex w-full flex-col">
          <div className="mb-2 flex w-full items-center justify-between">
            <span className="w-fit cursor-pointer underline-offset-1 hover:underline">
              {tool.name}
            </span>

            {tool.rating === 0 ? (
              <span className="text-xs text-muted-foreground">no ratings</span>
            ) : (
              <div className="flex w-fit items-center gap-1 rounded-full bg-secondary px-3 py-1">
                <Star
                  className={cn("size-4 fill-yellow-500 text-yellow-500")}
                />
                <span className="pt-[2px]">
                  {Number(tool.rating) % 1 === 0
                    ? Number(tool.rating).toFixed(0)
                    : Number(tool.rating).toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tags (with overflow detection) */}
      <TagsOverflow
        tags={tags}
        allowOverflow={true}
        onTagClick={(tagName) => {
          setPage(1);
          if (!filterTags?.includes(tagName)) {
            setFilterTags([...(filterTags ?? []), tagName]);
          }
        }}
      />

      {/* Analytics row */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          {/* Created at */}
          <div className="text-xs text-muted-foreground">{`Released ${formatDistanceToNow(
            tool.createdAt,
          )} ago`}</div>
        </div>

        <div className="flex items-center gap-2">
          {/* Views */}
          <span className="flex items-center gap-1 text-muted-foreground">
            <Eye className="size-4" />
            <span className="text-xs">{millify(analytics?.views ?? 0)}</span>
          </span>
          {/* Favorites */}
          <span
            id={`favorite-${tool.id}`}
            className="group relative flex items-center gap-1 text-muted-foreground"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToFavoritesMutation.mutate({
                toolId: tool.id,
              });
            }}
          >
            <label
              htmlFor={`favorite-${tool.id}`}
              className="absolute -inset-1 z-0 hidden rounded-[3px] bg-primary group-hover:block"
            ></label>
            <div className="relative z-10 flex items-center gap-1 group-hover:text-white">
              <Bookmark className="size-4" />
              <span className="text-xs">
                {millify(analytics?.favorites ?? 0)}
              </span>
            </div>
          </span>
        </div>
      </div>
    </a>
  );
}

function Skeleton() {
  return (
    <div className="flex h-[250px] w-full animate-pulse flex-col rounded-md border border-border bg-secondary p-4"></div>
  );
}

ToolCard.Skeleton = Skeleton;

export default ToolCard;

export function TagsOverflow({
  tags,
  onTagClick,
  allowOverflow = false,
}: {
  tags: Tag[];
  onTagClick: (tagName: string) => void;
  allowOverflow?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(tags.length);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    if (allowOverflow) return;
    // First, reset visibleCount to ensure we measure properly.
    setVisibleCount(tags.length);

    // Use a microtask/timeout to let React render all tags before measuring
    const measureTimeout = setTimeout(() => {
      const container = containerRef.current!;
      const children = Array.from(container.children) as HTMLElement[];

      let lastVisibleIndex = children.length; // all are potentially visible
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (!child) continue;
        // If a tag's right edge extends past -20px of the container's right edge,
        // the child is considered overflowing. We'll record the previous index as last visible.
        if (child.offsetLeft + child.offsetWidth > container.offsetWidth - 20) {
          lastVisibleIndex = i;
          break;
        }
      }

      setVisibleCount(lastVisibleIndex);
    }, 0);

    return () => clearTimeout(measureTimeout);
  }, [tags]);

  const hiddenCount = tags.length - visibleCount;

  return (
    <div
      ref={containerRef}
      className="mb-4 flex w-full gap-2 overflow-hidden"
      style={{ flexWrap: "nowrap" }} // Single-line display
    >
      {tags.slice(0, visibleCount).map((tag) => (
        <Badge
          variant="secondary"
          key={tag.name}
          className="cursor-pointer whitespace-nowrap"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onTagClick(tag.name);
          }}
        >
          {tag.name}
        </Badge>
      ))}

      {/* Show "+X more" if some tags don't fit */}
      {hiddenCount > 0 && (
        <Badge variant="secondary" className="whitespace-nowrap">
          + {hiddenCount}
        </Badge>
      )}
    </div>
  );
}
