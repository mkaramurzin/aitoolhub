import { api } from "@/trpc/server";
import { SearchClientPage } from "./search.client";

type tSearchParams = Promise<{
  tags?: string;
  orderBy?: "trending" | "new";
}>;

export default async function Search(props: { searchParams: tSearchParams }) {
  const { orderBy } = await props.searchParams;
  const { tags } = await api.tags.fetchPopular();
  return (
    <>
      <SearchClientPage tags={tags} orderBy={orderBy} />
    </>
  );
}
