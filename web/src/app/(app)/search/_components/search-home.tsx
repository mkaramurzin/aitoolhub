import CollectionCard from "@/app/_components/collection-card";
import { Gallery } from "@/app/_components/gallery";
import GalleryToolCard from "@/app/_components/gallery-tool-card";
import { useIsMobile } from "@/hooks/use-mobile";
import { api } from "@/trpc/react";
import { Tag } from "@prisma/client";
import { Heart, Star, TrendingUp } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import { SearchBox } from "./search-box";
import { SearchOptions } from "./search-options";
import { SearchTitle } from "./search-title";

export function SearchHomePage(props: { tags?: Tag[] }) {
  const defaultToolsQuery = api.tools.defaultTools.useQuery();
  const collectionsQuery = api.tools.collections.fetchAll.useQuery({});
  const galleryToolSkeletons = Array.from({ length: 20 }, (_, i) => (
    <GalleryToolCard.Skeleton key={i} />
  ));
  const collectionSkeletons = Array.from({ length: 20 }, (_, i) => (
    <CollectionCard.Skeleton key={i} />
  ));

  const isMobile = useIsMobile();

  return (
    <div className="flex h-full w-full flex-1 flex-grow flex-col items-center justify-center gap-8">
      <div className="flex w-full flex-col items-center justify-center gap-8 px-6">
        <SearchTitle />
        <div className="flex w-full max-w-xl gap-6">
          <SearchBox />
        </div>
        <SearchOptions />
      </div>

      <Gallery
        options={{ width: isMobile ? "300px" : "450px" }}
        icon={<Heart className="size-5 text-red-500" />}
        title="Our Picks"
        items={
          collectionsQuery.data?.collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              tools={collection.CollectionTools.map((tool) => tool.Tool)}
            />
          )) ?? collectionSkeletons
        }
      />

      <Gallery
        icon={<Star className="size-5 text-yellow-500" />}
        title="New Tools"
        items={
          defaultToolsQuery.data?.newTools.map((tool) => (
            <GalleryToolCard
              key={tool.id}
              href={`/tools/${tool.id}`}
              tool={tool}
              tags={tool.ToolTags.flatMap((tag) => tag.Tag)}
            />
          )) ?? galleryToolSkeletons
        }
      />

      <Gallery
        icon={
          <TrendingUp className="size-5 fill-emerald-500 text-emerald-500" />
        }
        title="Trending Tools"
        items={
          defaultToolsQuery.data?.trendingTools.map((tool) => (
            <GalleryToolCard
              key={tool.id}
              href={`/tools/${tool.id}`}
              tool={tool}
              tags={tool.ToolTags.flatMap((tag) => tag.Tag)}
            />
          )) ?? galleryToolSkeletons
        }
      />
    </div>
  );
}
