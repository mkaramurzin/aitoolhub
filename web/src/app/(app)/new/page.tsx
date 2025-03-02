import { NewClientPage } from "./new.client";

type tParams = Promise<{}>;

export default async function ToolsPage(props: { params: tParams }) {
  return <NewClientPage />;
}
