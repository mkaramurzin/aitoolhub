"use client";
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
        <div
          className="p-1 pt-4"
          onClick={() => {
            toggleSidebar();
          }}
        >
          <Menu className="size-6 [&>svg]:h-5 [&>svg]:w-5" />
        </div>
      )}
    </div>
  );
}
