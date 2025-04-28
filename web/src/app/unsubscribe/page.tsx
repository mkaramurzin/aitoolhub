import { FullScreenSignIn } from "@/components/sign-in";
import { api } from "@/trpc/server";
import { UnsubscribePage } from "./unsubscribe.client";

export type FavoritesServerPageProps = {};

export default async function SubmitPage(props: FavoritesServerPageProps) {
  const { user } = await api.users.self();

  if (!user) {
    return <FullScreenSignIn />;
  }

  return <UnsubscribePage />;
}
