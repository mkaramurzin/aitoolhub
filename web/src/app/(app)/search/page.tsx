import { api } from "@/trpc/server";
import { SearchClientPage } from "./search.client";

type tSearchParams = Promise<{
  tags?: string;
}>;

export default async function Search(props: { searchParams: tSearchParams }) {
  const { tags } = await api.tags.fetchPopular();
  return (
    <>
      <SearchClientPage tags={tags} />
    </>
  );
}
