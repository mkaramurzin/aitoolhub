import { SubscribeEmailCapture } from "@/app/_components/subscribe-email-capture";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Mail, Star, TrendingUp } from "lucide-react";
import { useQueryState } from "nuqs";

export function SearchOptions() {
  const [page, setPage] = useQueryState("page", {
    shallow: true,
    history: "push",
    parse: (v) => parseInt(v),
  });
  const [orderBy, setOrderBy] = useQueryState("orderBy", {
    shallow: true,
    history: "push",
  });
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
        // {
        //   icon: {
        //     component: Heart,
        //     className: "text-red-500",
        //   },
        //   text: "Our Picks",
        // },
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
              "secondary flex cursor-pointer gap-2 rounded-full px-3 py-1",
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
