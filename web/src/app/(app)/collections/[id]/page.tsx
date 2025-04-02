import { api } from "@/trpc/server";
import type { Metadata, ResolvingMetadata } from "next";
import { CollectionClientPage } from "./view.collection.client";

type tParams = Promise<{
  id: string;
}>;

export async function generateMetadata(
  { params }: { params: tParams },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // read route params
  const { id } = await params;

  // fetch data
  const { collection } = await api.tools.collections.fetch({ slug: id });

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];

  if (!collection) {
    return {
      title: "Collection not found",
      openGraph: {
        images: [],
      },
    };
  }

  return {
    title: collection.name,
    description: collection.description,
    openGraph: {
      images: [collection.image, ...previousImages],
    },
  };
}

export default async function CollectionServerPage(props: { params: tParams }) {
  const { id } = await props.params;

  const { collection } = await api.tools.collections.fetch({ slug: id });
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
