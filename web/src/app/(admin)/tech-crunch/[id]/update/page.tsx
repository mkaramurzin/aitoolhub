import { FullScreenSignIn } from "@/components/sign-in";
import { api } from "@/trpc/server";
import { TechCrunchUpsertPage } from "../../upsert.tech-crunch.client";

type tParams = Promise<{
  id: string;
}>;

export default async function TechCrunchUpdatePage(props: { params: tParams }) {
  const { id } = await props.params;

  const { user } = await api.users.self();
  if (!user) {
    return <FullScreenSignIn />;
  }

  const { techCrunch } = await api.techCrunch.fetch({ id });

  return <TechCrunchUpsertPage techCrunch={techCrunch} />;
}
