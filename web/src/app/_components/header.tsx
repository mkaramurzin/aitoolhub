"use client";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";

export type HeaderProps = {};

export function Header(props: HeaderProps) {
  const { open, toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }
  return (
    <div className="flex h-14 w-full items-center gap-4 px-4 py-3">
      {open ? null : (
        <Button onClick={toggleSidebar} variant={"ghost"} size="icon">
          <Menu className="size-4" />
        </Button>
      )}
    </div>
  );
}
