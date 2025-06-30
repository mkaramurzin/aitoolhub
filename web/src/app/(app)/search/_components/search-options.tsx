import { SubscribeEmailCapture } from "@/app/_components/subscribe-email-capture";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useFilterDrawer } from "@/store/useFilterDrawer";
import { Filter, Mail, Star, TrendingUp } from "lucide-react";
import { useQueryState } from "nuqs";

export function SearchOptions() {
  const [page, setPage] = useQueryState("page", {
    shallow: false,
    history: "push",
    parse: (v) => parseInt(v),
  });
  const [orderBy, setOrderBy] = useQueryState("orderBy", {
    shallow: false,
    history: "push",
  });
  const [tags, setTags] = useQueryState("tags", {
    shallow: false,
    history: "push", 
    parse: (v) => v.split(",").filter((v) => v.length > 0),
  });
  const { setOpen: setFilterDrawerOpen, open: filterDrawerOpen } = useFilterDrawer();
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {[
        {
          id: "new",
          icon: {
            component: Star,
            className: "text-yellow-500 ",
          },
          text: "New Tools",
          onClick: () => {
            setPage(1);
            setOrderBy("new");
          },
        },
        {
          id: "trending",
          icon: {
            component: TrendingUp,
            className: "text-emerald-500 fill-emerald-500",
          },
          text: "Trending",
          onClick: () => {
            setPage(1);
            setOrderBy("trending");
          },
        },
        {
          id: "filters",
          icon: {
            component: Filter,
            className: "text-purple-500",
          },
          text: "Filters",
          onClick: () => {
            if (!filterDrawerOpen) {
              setFilterDrawerOpen(true);
            }
          },
          hasNotification: tags && tags.length > 0,
          notificationCount: tags?.length || 0,
        },
        {
          id: "subscribe",
          icon: {
            component: Mail,
            className: "text-blue-500",
          },
          text: "Subscribe",
          onClick: () => {},
        },
      ].map((item) => {
        const tagButton = (
          <Badge
            variant={"secondary"}
            className={cn(
              "secondary relative flex cursor-pointer gap-2 rounded-full px-3 py-1",
            )}
            key={item.id}
            onClick={item.onClick}
          >
            <item.icon.component
              className={cn("size-5", item.icon.className)}
            />
            <span
              className={cn(
                "text-base font-normal",
                item.id === orderBy && "text-white",
              )}
            >
              {item.text}
            </span>
            {item.hasNotification && item.notificationCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {item.notificationCount}
              </span>
            )}
          </Badge>
        );
        if (item.id === "subscribe") {
          return (
            <Dialog key={item.id}>
              <DialogTitle className="hidden"></DialogTitle>

              <DialogTrigger asChild>{tagButton}</DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <SubscribeEmailCapture />
              </DialogContent>
            </Dialog>
          );
        }
        return tagButton;
      })}
    </div>
  );
}
