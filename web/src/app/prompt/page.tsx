import { api } from "@/trpc/server";
import UpdatePromptPage from "./update-prompt-page";

export default async function Home() {
  const { kv } = await api.keyValues.get({ key: "prompt" });
  const { user } = await api.users.self();
  if (
    !["dylancronkhite1@gmail.com", "moorenik51@gmail.com"].includes(
      user?.email ?? "",
    )
  ) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-green-900 via-gray-900 to-gray-900 p-6">
        <h1 className="text-4xl text-white">
          You are not authorized to perform this action.
        </h1>
      </main>
    );
  }
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-green-900 via-gray-900 to-gray-900 p-6">
      <UpdatePromptPage prompt={kv.value ?? ""} />
    </main>
  );
}
