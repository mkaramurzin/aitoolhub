import { api } from "@/trpc/server";
import { SearchClientPage } from "./search.client";

type tSearchParams = Promise<{
  tags?: string;
  orderBy?: "trending" | "new";
}>;

export default async function Search(props: { searchParams: tSearchParams }) {
  const { orderBy } = await props.searchParams;
  const { tags } = await api.tags.fetchPopular();
  const { newTools, trendingTools } = await api.tools.defaultTools();
  return (
    <>
      <SearchClientPage tags={tags} orderBy={orderBy} />
    </>
  );
}
