import { SearchesClientPage } from "./searches.client.page";

export type SearchesServerPageProps = {};

export default function SearchesServerPage(props: SearchesServerPageProps) {
  return <SearchesClientPage />;
}
