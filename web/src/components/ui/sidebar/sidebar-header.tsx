"use client";
import { PanelLeftOpen } from "lucide-react";

import { SidebarMenuButton, SidebarMenuItem, useSidebar } from "../sidebar";

export type SidebarHeaderContentsProps = {};

export function SidebarHeaderContents(props: SidebarHeaderContentsProps) {
  const { toggleSidebar, open } = useSidebar();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => {
          toggleSidebar();
        }}
      >
        <PanelLeftOpen />
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
