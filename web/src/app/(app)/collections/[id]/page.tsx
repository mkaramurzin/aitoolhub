import { api } from "@/trpc/server";
import { CollectionClientPage } from "./view.collection.client";

type tParams = Promise<{
  id: string;
}>;

export default async function CollectionServerPage(props: { params: tParams }) {
  const { id } = await props.params;

  const { collection } = await api.tools.collections.fetch({ id });
  if (!collection) {
    return <>Collection not found</>;
  }

  return (
    <CollectionClientPage
      collection={collection}
      tools={collection.CollectionTools.map((collectionTool) => ({
        tool: collectionTool.Tool,
        review: collection.CollectionToolReviews.find(
          (collectionToolReview) => {
            return collectionToolReview.Review.toolId === collectionTool.toolId;
          },
        )?.Review,
        tags: collectionTool.Tool.ToolTags.map((tag) => tag.Tag),
      }))}
    />
  );
}
