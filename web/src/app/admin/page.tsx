import { api } from "@/trpc/server";
import AdminClientPage from "./admin.client";

export type AdminPageProps = {};

async function AdminPage({}: AdminPageProps) {
  const { user } = await api.users.self();
  if (!user || user.role !== "admin") {
    return <>No Access</>;
  }

  return <AdminClientPage />;
}
export default AdminPage;
