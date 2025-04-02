import { api } from "@/trpc/server";
import UpsertCollectionsClientPage from "../../upsert.collections.client";

type tParams = Promise<{
  id: string;
}>;

export default async function UpsertCollectionServerPage(props: {
  params: tParams;
}) {
  const { id } = await props.params;

  const { collection } = await api.tools.collections.fetch({ slug: id });
  if (!collection) {
    return <>Collection not found</>;
  }
  return (
    <UpsertCollectionsClientPage
      collection={collection}
      tools={collection.CollectionTools.map((ct) => {
        const review = collection.CollectionToolReviews.find(
          (ctr) => ctr.Review.toolId === ct.toolId,
        );
        return {
          tool: ct.Tool,
          review: review ? review.Review : undefined,
        };
      })}
    />
  );
}
