import { api } from "@/trpc/server";

export default async function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = await api.users.self();
  if (!user || user.role !== "admin") {
    return <>No Access</>;
  }
  return <>{children}</>;
}
