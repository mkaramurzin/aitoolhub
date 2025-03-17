"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useSidebarStore } from "@/store/useSideBarStore";
import { RiGoogleFill } from "@remixicon/react";
import { ChevronsUpDown, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function SidebarFootContent({
  user,
}: {
  user?: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile, open, setOpen } = useSidebar();
  const router = useRouter();
  const { setForceOpen } = useSidebarStore();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {user ? (
          <DropdownMenu
            onOpenChange={(open) => {
              setForceOpen(open);
            }}
          >
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.name && user.name.length > 0 ? user.name[0] : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">
                      {" "}
                      {user.name && user.name.length > 0 ? user.name[0] : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              {/* <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <a
                  target="_blank"
                  href="https://x.com/AgentPP_AI"
                  className="group"
                >
                  <DropdownMenuItem>
                    <XIcon className="mr-2 fill-foreground group-hover:fill-background" />
                    X
                  </DropdownMenuItem>
                </a>
                <a
                  target="_blank"
                  href="https://t.me/agentbigpp"
                  className="group"
                >
                  <DropdownMenuItem>
                    <TelegramIcon className="mr-2 fill-foreground group-hover:fill-background" />
                    Telegram
                  </DropdownMenuItem>
                </a>
                <a
                  target="_blank"
                  href="https://discord.gg/nzNJC5rNBy"
                  className="group"
                >
                  <DropdownMenuItem>
                    <DiscordIcon className="mr-2 fill-foreground group-hover:fill-background" />
                    Discord
                  </DropdownMenuItem>
                </a>
                <a target="_blank" href="https://docs.agentpp.ai/">
                  <DropdownMenuItem>
                    <BookOpen className="mr-2" />
                    Docs
                  </DropdownMenuItem>
                </a>
              </DropdownMenuGroup> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  await authClient.signOut();
                  router.refresh();
                }}
              >
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu
            onOpenChange={(open) => {
              setForceOpen(open);
            }}
          >
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="pl-4 text-lg data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                {open ? (
                  <>Sign In</>
                ) : (
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">?</AvatarFallback>
                  </Avatar>
                )}
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => {
                    authClient.signIn.social({
                      provider: "google",
                      callbackURL: window.location.href,
                    });
                  }}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <span className="pointer-events-none me-2">
                    <RiGoogleFill
                      className="opacity-60"
                      size={16}
                      aria-hidden="true"
                    />
                  </span>
                  Login with Google
                </DropdownMenuItem>
              </DropdownMenuGroup>

              {/* <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <a
                  target="_blank"
                  href="https://x.com/AgentPP_AI"
                  className="group"
                >
                  <DropdownMenuItem>
                    <XIcon className="mr-2 fill-foreground group-hover:fill-background" />
                    X
                  </DropdownMenuItem>
                </a>
                <a
                  target="_blank"
                  href="https://t.me/agentbigpp"
                  className="group"
                >
                  <DropdownMenuItem>
                    <TelegramIcon className="mr-2 fill-foreground group-hover:fill-background" />
                    Telegram
                  </DropdownMenuItem>
                </a>
                <a
                  target="_blank"
                  href="https://discord.gg/nzNJC5rNBy"
                  className="group"
                >
                  <DropdownMenuItem>
                    <DiscordIcon className="mr-2 fill-foreground group-hover:fill-background" />
                    Discord
                  </DropdownMenuItem>
                </a>
                <a target="_blank" href="https://docs.agentpp.ai/">
                  <DropdownMenuItem>
                    <BookOpen className="mr-2" />
                    Docs
                  </DropdownMenuItem>
                </a>
              </DropdownMenuGroup> */}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
