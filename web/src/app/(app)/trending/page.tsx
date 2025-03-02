import { TrendingClientPage } from "./trending.client";

type tParams = Promise<{}>;

export default async function ToolsPage(props: { params: tParams }) {
  return <TrendingClientPage />;
}
