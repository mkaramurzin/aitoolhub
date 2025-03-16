import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/sidebar/app-sidebar";
import FilterDrawer from "@/components/ui/sidebar/filters-side-bar";
import { api } from "@/trpc/server";
import { cookies } from "next/headers";
import { Header } from "../_components/header";

export default async function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = await api.users.self();
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <div>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar
          user={
            user
              ? {
                  name: user.name,
                  email: user.email,
                  image: user.image || undefined,
                }
              : undefined
          }
        />
        <FilterDrawer />
        <div className="flex min-h-dvh w-full flex-col">
          <Header />
          {children}
        </div>
      </SidebarProvider>
    </div>
  );
}
