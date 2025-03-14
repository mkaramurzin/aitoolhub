import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tag, Tool } from "@prisma/client";
import { Star } from "lucide-react";
import { useQueryState } from "nuqs";

function ToolCard({
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
  return (
    <a
      href={href}
      key={tool.id}
      className="group flex w-full flex-col rounded-md border border-border bg-card p-4 hover:border-primary"
    >
      {/* Image and name */}
      <div className="mb-4 flex gap-4">
        <img src={tool.image} alt={tool.name} className="size-12 rounded-md" />
        <div className="flex w-full flex-col">
          <div className="mb-2 flex w-full items-center justify-between">
            <span className="w-fit cursor-pointer underline-offset-1 hover:underline">
              {tool.name}
            </span>

            <div className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1">
              <Star className={cn("size-4 fill-yellow-500 text-yellow-500")} />
              <span className="pt-[2px]">
                {Number(tool.rating) % 1 === 0
                  ? Number(tool.rating).toFixed(0)
                  : Number(tool.rating).toFixed(1)}
              </span>
            </div>
          </div>
          <span className="line-clamp-3 text-sm text-muted-foreground">
            {tool.description}
          </span>
        </div>
      </div>
      {/* Tags */}
      <div className="flex flex-wrap gap-4">
        {tags.map((tag) => (
          <Badge
            variant={"secondary"}
            key={tag.name}
            className="cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
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

export default ToolCard;
