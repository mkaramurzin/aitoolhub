"use client";
import { SearchPage } from "@/app/_components/search";
import { Tag } from "@prisma/client";

export type SearchClientPageProps = {
  tags?: Tag[];
  orderBy?: "trending" | "new";
};

export function SearchClientPage(props: SearchClientPageProps) {
  return (
    <div className="flex h-full w-full flex-col items-center">
      <div className="flex w-full flex-1 justify-center pt-4">
        <SearchPage tags={props.tags} orderBy={props.orderBy} />
      </div>

      <div></div>
    </div>
  );
}
