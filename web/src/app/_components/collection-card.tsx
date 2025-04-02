import { useIsMobile } from "@/hooks/use-mobile";
import { Collection, Tool } from "@prisma/client";
import { MoveRight } from "lucide-react";

export type CollectionCardProps = {
  collection: Collection;
  tools: Tool[];
};

function CollectionCard({ collection, tools }: CollectionCardProps) {
  const isMobile = useIsMobile();

  const cutTools = isMobile ? tools.slice(0, 4) : tools.slice(0, 5);

  return (
    <a
      href={`/collections/${collection.slug}`}
      key={collection.id}
      className="group relative top-1/2 flex h-[200px] w-full -translate-y-1/2 cursor-pointer flex-col justify-between gap-2 rounded-md border border-border bg-card p-4 md:h-[300px]"
    >
      <img
        src={collection.image}
        alt={`${collection.name} image`}
        className="absolute left-0 top-0 w-full rounded-md object-cover"
      />

      {/* Background gradient */}
      <div className="to-slate-[#000000] absolute bottom-0 left-0 h-2/6 w-full rounded-b-md bg-gradient-to-t from-slate-800/70 transition-all duration-500 group-hover:h-3/6"></div>
      <div className="to-slate-[#000000] absolute left-0 top-0 h-2/6 w-full rounded-t-md bg-gradient-to-b from-slate-800/70 transition-all duration-500 group-hover:h-3/6"></div>

      <div className="z-10 flex w-full text-start">
        <div className="flex w-full flex-col text-2xl font-semibold drop-shadow-lg">
          <span className="">{collection.name}</span>
        </div>
      </div>

      <div className="z-10 flex flex-col text-start">
        <div className="flex w-full flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="flex w-full flex-wrap items-end gap-1 space-x-reverse md:max-w-[55%]">
            {cutTools.map((tool) => (
              <img
                key={tool.id}
                src={tool.image}
                alt={`${tool.name} image`}
                className="max-h-8 max-w-8 rounded-sm bg-background object-cover"
              />
            ))}

            {cutTools.length < tools.length && (
              <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-background text-sm font-semibold text-muted-foreground">
                +{tools.length - cutTools.length}
              </span>
            )}
          </div>
          <div className="flex w-fit items-center gap-2 rounded-full bg-background/50 px-3 py-1 text-sm group-hover:bg-background/70">
            <span className="">View Collection</span>
            <MoveRight className="size-4" />
          </div>
        </div>
      </div>
    </a>
  );
}

CollectionCard.Skeleton = function Skeleton() {
  return (
    <div className="flex h-[300px] w-full animate-pulse flex-col items-start justify-start gap-2 rounded-md bg-secondary"></div>
  );
};

export default CollectionCard;
