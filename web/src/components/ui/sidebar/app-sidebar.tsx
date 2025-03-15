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
import { cn } from "@/lib/utils";
import { Info, Menu, Search, SquarePlus } from "lucide-react";
import { useSidebar } from "../sidebar";
import { SidebarFootContent } from "../sidebar-footer-content";

const items = [
  {
    title: "Search",
    url: "/search",
    icon: Search,
  },
  // {
  //   title: "Home",
  //   url: "/search",
  //   icon: Home,
  // },
  // {
  //   title: "Trending",
  //   url: "/trending",
  //   icon: TrendingUp,
  // },
  // {
  //   title: "Just Launched",
  //   url: "/new",
  //   icon: Plane,
  // },
  {
    title: "Submit & Advertise",
    url: "/submissions",
    icon: SquarePlus,
  },
  {
    title: "Contact Us",
    url: "/contact-us",
    icon: Info,
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
  const { toggleSidebar, open, setOpen } = useSidebar();

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      onMouseEnter={() => {
        setOpen(true);
      }}
      onMouseLeave={() => {
        setOpen(false);
      }}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="w-fit [&>svg]:size-5"
              onClick={() => {
                toggleSidebar();
              }}
            >
              <div className={cn(open ? "" : "-ml-1")}>
                <Menu />
              </div>
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
                  <SidebarMenuButton
                    size={"lg"}
                    asChild
                    className="[&>svg]:size-5 group-data-[collapsible=icon]:[&>svg]:ml-1.5"
                  >
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
