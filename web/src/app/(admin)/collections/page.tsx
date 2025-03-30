import { api } from "@/trpc/server";
import CollectionsClientPage from "./collections.client";

export type CollectionsPageProps = {};

async function CollectionsPage({}: CollectionsPageProps) {
  return <CollectionsClientPage />;
}
export default CollectionsPage;
