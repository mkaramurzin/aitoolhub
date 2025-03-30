import { FullScreenSignIn } from "@/components/sign-in";
import { api } from "@/trpc/server";
import { SubmissionsUpsertPage } from "../../upsert.submissions.client";

type tParams = Promise<{
  id: string;
}>;

export default async function SubmitPage(props: { params: tParams }) {
  const { id } = await props.params;

  const { user } = await api.users.self();
  if (!user) {
    return <FullScreenSignIn />;
  }

  const { tool } = await api.tools.fetch({ id });

  return (
    <SubmissionsUpsertPage
      tool={tool}
      tags={tool.ToolTags.flatMap((tt) => tt.Tag)}
    />
  );
}
