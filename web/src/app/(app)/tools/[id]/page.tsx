import { api } from "@/trpc/server";
import type { Metadata, ResolvingMetadata } from "next";
import { ToolsClientPage } from "./tools.client";

type tParams = Promise<{
  id: string;
}>;

type tSearchParams = Promise<{
  page?: number;
}>;

export async function generateMetadata(
  { params }: { params: tParams },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // read route params
  const { id } = await params;

  // fetch data
  const { tool } = await api.tools.fetch({ slug: id });

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];

  if (!tool) {
    return {
      title: "Tool not found",
      openGraph: {
        images: [],
      },
    };
  }

  return {
    title: tool.name,
    description: tool.description,
    openGraph: {
      images: [tool.image, ...previousImages],
    },
  };
}

export default async function ToolsPage(props: {
  params: tParams;
  searchParams: tSearchParams;
}) {
  const { id } = await props.params;
  const { page } = await props.searchParams;
  const { tool } = await api.tools.fetch({ slug: id });
  const { reviews, count } = await api.reviews.fetchAll({
    toolId: tool.id,
    page: page ? Number(page) : 1,
  });

  await api.tools.analytics.increment({
    id: tool.id,
    views: true,
  });

  const { favorite } = await api.tools.favorites.fetch({ toolId: tool.id });

  return (
    <ToolsClientPage
      reviewsCount={count}
      reviews={reviews.map((review) => ({
        review,
        user: {
          name: review.User.name,
        },
      }))}
      tool={tool}
      tags={tool.ToolTags.flatMap((tt) => tt.Tag)}
      isFavorite={Boolean(favorite)}
    />
  );
}
