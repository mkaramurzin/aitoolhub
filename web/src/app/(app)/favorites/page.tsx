import { FullScreenSignIn } from "@/components/sign-in";
import { api } from "@/trpc/server";
import { FavoriteClientPage } from "./favorites.client";

export type FavoritesServerPageProps = {};

export default async function SubmitPage(props: FavoritesServerPageProps) {
  const { user } = await api.users.self();

  if (!user) {
    return <FullScreenSignIn />;
  }

  return <FavoriteClientPage />;
}
