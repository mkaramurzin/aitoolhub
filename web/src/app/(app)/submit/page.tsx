import { FullScreenSignIn } from "@/components/sign-in";
import { api } from "@/trpc/server";
import { SubmitClientPage } from "./submit.cleint";

export type SubmitPageProps = {};

export default async function SubmitPage(props: SubmitPageProps) {
  const { user } = await api.users.self();

  if (!user) {
    return <FullScreenSignIn />;
  }
  const { tools } = await api.tools.fetchOwned({});
  return <SubmitClientPage tools={tools} />;
}
