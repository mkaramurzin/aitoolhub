import FeedbackPage from "./feedback.client.page";

type tParams = Promise<{
  id: string;
}>;

type tSearchParams = Promise<{
  rating?: number;
  email?: string;
}>;

export default async function CollectionServerPage(props: {
  params: tParams;
  searchParams: tSearchParams;
}) {
  const { id } = await props.params;
  const { rating, email } = await props.searchParams;

  return (
    <FeedbackPage techCrunchId={id} rating={Number(rating)} email={email} />
  );
}
