import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { Tag, Tool, ToolAnalytics } from "@prisma/client";
import { formatDistanceToNowStrict } from "date-fns";
import { Bookmark, ChartNoAxesColumnIcon, Star } from "lucide-react";
import millify from "millify";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { TagsOverflow } from "./tool-card";

function GalleryToolCard({
  tool,
  tags,
  href,
  analytics,
  isFavorite,
}: {
  tool: Tool;
  tags: Tag[];
  href: string;
  analytics?: ToolAnalytics | null;
  isFavorite: boolean;
}) {
  const [isFavorited, setIsFavorited] = useState(isFavorite);

  const [filterTags, setFilterTags] = useQueryState("tags", {
    shallow: true,
    history: "push",
    parse: (v) => v.split(",").filter((v) => v.length > 0),
  });
  const [page, setPage] = useQueryState("page", {
    shallow: true,
    history: "push",
    parse: (v) => parseInt(v),
  });

  const addToFavoritesMutation = api.tools.favorites.upsert.useMutation({
    onSuccess: () => {
      toast("Saved to favorites");
      setIsFavorited(true);
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

  const removeFromFavoritesMutation = api.tools.favorites.delete.useMutation({
    onSuccess: () => {
      toast("Removed from favorites");
      setIsFavorited(false);
    },
  });

  return (
    <a
      href={href}
      key={tool.id}
      className="flex w-full flex-col rounded-md border border-border bg-card p-4 text-start"
    >
      {/* Image and name */}
      <div className="mb-4 flex gap-4">
        {tool.image && tool.image.length > 0 ? (
          <img
            src={tool.image}
            alt={tool.name}
            className="size-16 h-full max-h-16 min-h-16 w-full max-w-16 rounded-md"
          />
        ) : (
          <div className="h-16 min-h-16 w-16 min-w-16 rounded-md bg-secondary"></div>
        )}
        <div className="flex w-full flex-col">
          <div className="mb-2 flex flex-1 w-full items-center justify-between gap-2">
            <span className="line-clamp-1 w-fit cursor-pointer underline-offset-1 hover:underline">
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
          {/* Summary */}
          <div className="mb-2 flex flex-1 w-full items-center justify-between gap-2">
            {tool.summary !== '' &&
              <span className="text-muted-foreground line-clamp-1 text-xs">
                {tool.summary}
              </span>
            }
          </div>
        </div>
      </div>

      {/* Tags (with overflow detection) */}
      <TagsOverflow
        tags={tags}
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
          <div className="text-xs text-muted-foreground">{`${formatDistanceToNowStrict(tool.createdAt)} ago`}</div>
        </div>

        <div className="flex justify-center gap-2">
          {/* Views */}
          <span className="flex items-center gap-1 text-muted-foreground">
            <ChartNoAxesColumnIcon className="size-4" />
            <span className="text-xs">{millify(analytics?.views ?? 0)}</span>
          </span>
          {/* Favorites */}
          <span
            id={`favorite-${tool.id}`}
            className="group relative flex items-center gap-1 text-muted-foreground"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isFavorited) {
                removeFromFavoritesMutation.mutate({
                  toolId: tool.id,
                });
                return;
              }

              addToFavoritesMutation.mutate({
                toolId: tool.id,
              });
            }}
          >
            <label
              htmlFor={`favorite-${tool.id}`}
              className="absolute -inset-1 z-0 hidden rounded-[3px] bg-primary group-hover:block"
            ></label>
            <div
              className={cn(
                "relative z-10 flex items-center gap-1 group-hover:text-white",
                isFavorited && "text-primary",
              )}
            >
              <Bookmark
                className={cn(
                  "size-4",
                  isFavorited ? "fill-primary group-hover:fill-white" : "",
                )}
              />
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

GalleryToolCard.Skeleton = Skeleton;
export default GalleryToolCard;
