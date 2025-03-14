import { api } from "@/trpc/server";
import { SearchClientPage } from "./search.client";

type tSearchParams = Promise<{
  tags?: string;
  orderBy?: "trending" | "new";
}>;

export default async function Search(props: { searchParams: tSearchParams }) {
  const { orderBy } = await props.searchParams;
  const { tags } = await api.tags.fetchPopular();
  const { count } = await api.tools.count();
  const { newTools, trendingTools } = await api.tools.defaultTools();
  return (
    <>
      <SearchClientPage tags={tags} toolCount={count} orderBy={orderBy} />
    </>
  );
}
