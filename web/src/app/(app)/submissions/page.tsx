import { FullScreenSignIn } from "@/components/sign-in";
import { api } from "@/trpc/server";
import { SubmissionsClientPage } from "./submissions.cleint";

export type SubmissionsPageProps = {};

export default async function SubmissionsPage(props: SubmissionsPageProps) {
  const { user } = await api.users.self();

  if (!user) {
    return <FullScreenSignIn />;
  }
  const { tools } = await api.tools.fetchOwned({});
  return (
    <SubmissionsClientPage
      tools={tools.map((tool) => ({
        tool: tool,
        tags: tool.ToolTags.flatMap((tt) => tt.Tag),
      }))}
    />
  );
}
