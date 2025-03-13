import { FullScreenSignIn } from "@/components/sign-in";
import { api } from "@/trpc/server";
import { SubmissionsUpsertPage } from "../submissions.upsert.cleint";

export type SubmitPageProps = {};

export default async function SubmitPage(props: SubmitPageProps) {
  const { user } = await api.users.self();
  if (!user) {
    return <FullScreenSignIn />;
  }

  return <SubmissionsUpsertPage />;
}
