import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tag, Tool } from "@prisma/client";
import { Star } from "lucide-react";
import { useQueryState } from "nuqs";

function GalleryToolCard({
  tool,
  tags,
  href,
}: {
  tool: Tool;
  tags: Tag[];
  href: string;
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
  return (
    <a
      href={href}
      key={tool.id}
      className="group flex h-[212px] w-full flex-col justify-between rounded-md border border-border bg-card p-4 text-start hover:border-primary"
    >
      {/* Image and name */}
      <div className="mb-4 flex gap-4">
        {tool.image && tool.image.length > 0 ? (
          <img
            src={tool.image}
            alt={tool.name}
            className="size-20 max-h-20 max-w-20 rounded-md"
          />
        ) : (
          <div className="h-20 min-h-20 w-20 min-w-20 rounded-md bg-secondary"></div>
        )}
        <div className="flex w-full flex-col">
          <div className="mb-2 flex w-full items-center justify-between gap-2">
            <span className="w-fit cursor-pointer underline-offset-1 hover:underline">
              {tool.name}
            </span>
          </div>

          {tool.rating === 0 ? (
            <span className="text-xs text-muted-foreground">no ratings</span>
          ) : (
            <div className="flex w-fit items-center gap-1 rounded-full bg-secondary px-3 py-1">
              <Star className={cn("size-4 fill-yellow-500 text-yellow-500")} />
              <span className="pt-[2px]">
                {Number(tool.rating) % 1 === 0
                  ? Number(tool.rating).toFixed(0)
                  : Number(tool.rating).toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            variant={"secondary"}
            key={tag.name}
            className="cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setPage(1);
              if (!filterTags?.includes(tag.name)) {
                setFilterTags([...(filterTags ?? []), tag.name]);
              }
            }}
          >
            {tag.name}
          </Badge>
        ))}
      </div>
    </a>
  );
}

export default GalleryToolCard;

export function GalleryToolCardSkeleton() {
  return (
    <div className="flex h-[250px] w-full animate-pulse flex-col rounded-md border border-border bg-secondary p-4"></div>
  );
}
