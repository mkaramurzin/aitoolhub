import { FullScreenSignIn } from "@/components/sign-in";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { SubmissionsClientPage } from "./submissions.client";

export type SubmissionsPageProps = {};

export default async function SubmissionsPage(props: SubmissionsPageProps) {
  const { user } = await api.users.self();

  if (!user) {
    return <FullScreenSignIn />;
  }
  const { tools } = await api.tools.fetchOwned({});

  if (tools.length < 1) {
    redirect("/submissions/new");
  }

  return (
    <SubmissionsClientPage
      tools={tools.map((tool) => ({
        tool: tool,
        tags: tool.ToolTags.flatMap((tt) => tt.Tag),
      }))}
    />
  );
}
