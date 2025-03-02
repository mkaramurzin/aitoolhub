"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Plane,
  Search,
  TrendingUp,
} from "lucide-react";
import { useSidebar } from "../sidebar";
import { SidebarFootContent } from "../sidebar-footer-content";

const items = [
  {
    title: "Search",
    url: "/search",
    icon: Search,
  },
  {
    title: "Trending",
    url: "/trending",
    icon: TrendingUp,
  },
  {
    title: "Just Launched",
    url: "/new",
    icon: Plane,
  },
  // {
  //   title: "Settings",
  //   url: "#",
  //   icon: Settings,
  // },
];

export function AppSidebar({
  user,
}: {
  user?: {
    name: string;
    email: string;
    image?: string;
  };
}) {
  const { toggleSidebar, open } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="w-fit"
              onClick={() => {
                toggleSidebar();
              }}
            >
              {open ? <PanelLeftClose /> : <PanelLeftOpen />}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="scrollbar scrollbar-track-background scrollbar-thumb-primary/50 hover:scrollbar-thumb-primary">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarFootContent
          user={
            user
              ? {
                  name: user.name,
                  email: user.email,
                  avatar: user.image ?? "https://github.com/shadcn.png",
                }
              : undefined
          }
        />
      </SidebarFooter>
    </Sidebar>
  );
}
