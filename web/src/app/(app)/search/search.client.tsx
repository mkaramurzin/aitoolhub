"use client";
import { SearchPage } from "@/app/_components/search";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tag } from "@prisma/client";

export type SearchClientPageProps = {
  tags?: Tag[];
  toolCount: number;
  orderBy?: "trending" | "new";
};

export function SearchClientPage(props: SearchClientPageProps) {
  const { open, toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  return (
    <div className="flex h-full w-full flex-col items-center">
      <div className="flex w-full flex-1 justify-center pt-4">
        <SearchPage
          tags={props.tags}
          toolCount={props.toolCount}
          orderBy={props.orderBy}
        />
      </div>

      <div></div>
    </div>
  );
}
