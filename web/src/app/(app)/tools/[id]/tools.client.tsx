"use client";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { Textarea } from "@/components/ui/textarea";
import { usePagination } from "@/hooks/use-pagination";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Review, Tag, Tool } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bookmark,
  EllipsisVertical,
  ExternalLink,
  Flag,
  Loader2,
  Star,
  ThumbsDown,
  ThumbsUp,
  Trash,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export type ToolsClientPageProps = {
  tool: Tool;
  tags: Tag[];
  reviews: {
    review: Review;
    user: {
      name: string;
    };
  }[];
  reviewsCount: number;
  isFavorite: boolean;
};

const FormSchema = z.object({
  content: z.string(),
  rating: z.number().int().min(1).max(5),
  toolId: z.string().uuid(),
});

export function ToolsClientPage({
  tool,
  tags,
  reviews,
  reviewsCount,
  isFavorite,
}: ToolsClientPageProps) {
  const router = useRouter();
  const [page, setPage] = useQueryState("page", {
    shallow: false,
    parse: (v) => parseInt(v),
  });
  const { data: userData } = authClient.useSession();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      content: "",
      rating: 5,
      toolId: tool.id,
    },
  });

  const adminDeleteMutation = api.tools.adminDelete.useMutation({
    onSuccess: () => {
      router.back();
    },
  });

  const reviewMutation = api.reviews.create.useMutation({
    onSuccess: () => {
      router.refresh();
      form.reset();
    },
  });

  const addToFavoritesMutation = api.tools.favorites.upsert.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  const removeFromFavoritesMutation = api.tools.favorites.delete.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  const tryItNowTrackingMutation = api.tools.analytics.increment.useMutation(
    {},
  );

  function onSubmit(data: z.infer<typeof FormSchema>) {
    reviewMutation.mutate(data);
  }

  const rating = form.watch("rating");

  const totalPages = Math.ceil(reviewsCount / 5);

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: page ?? 1,
    totalPages,
    paginationItemsToDisplay: 5,
  });

  function getPricing(p: string) {
    switch (p) {
      case "free":
        return "Free";
      case "paid":
        return "Paid";
      case "free-paid":
        return "Freemium";
      default:
        return tool.pricing;
    }
  }

  function favoritesButtonClicked() {
    if (isFavorite) {
      removeFromFavoritesMutation.mutate({ toolId: tool.id });
    } else {
      addToFavoritesMutation.mutate({ toolId: tool.id });
    }
  }

  const isAdmin = useMemo(() => {
    if (!userData?.user) return false;
    return userData.user.role === "admin";
  }, [userData]);

  return (
    <div className="flex h-full w-full justify-center">
      <div className="flex h-full w-full max-w-3xl flex-col items-center space-y-4 p-4 sm:pt-10">
        <div className="flex w-full gap-4 sm:hidden">
          {userData?.user && (
            <Button
              className="relative flex h-12 w-full items-center justify-center gap-2"
              variant={"secondary"}
              size={"lg"}
              onClick={favoritesButtonClicked}
            >
              <span
                className={cn(
                  addToFavoritesMutation.isPending ||
                    removeFromFavoritesMutation.isPending
                    ? "opacity-0"
                    : "opacity-100",
                  "flex items-center gap-2",
                )}
              >
                <Bookmark className="size-4" />
                {isFavorite ? "Remove" : "Save"}
              </span>

              {(addToFavoritesMutation.isPending ||
                removeFromFavoritesMutation.isPending) && (
                <Loader2 className="absolute size-4 animate-spin" />
              )}
            </Button>
          )}

          <a
            href={tool.url}
            target="_blank"
            className={cn(buttonVariants(), "flex h-12 w-full gap-2")}
            onClick={() => {
              tryItNowTrackingMutation.mutate({
                id: tool.id,
                tryItNowClicks: true,
              });
            }}
          >
            <span>Try it now</span>
            <ExternalLink className="size-4" />
          </a>
        </div>

        {isAdmin && (
          <div className="group flex w-full flex-col rounded-md border-border bg-primary/10 p-4">
            <span className="mb-4 text-xl">Admin</span>
            <div className="flex w-full gap-4">
              <Button
                disabled={adminDeleteMutation.isPending}
                onClick={() => {
                  adminDeleteMutation.mutate({ id: tool.id });
                }}
                type="button"
                className="relative flex items-center justify-center"
                variant="destructive"
              >
                <span
                  className={cn(
                    adminDeleteMutation.isPending ? "opacity-0" : "opacity-100",
                  )}
                >
                  Delete
                </span>

                {adminDeleteMutation.isPending && (
                  <Loader2 className="absolute size-4 animate-spin" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* tool */}
        <div
          key={tool.id}
          className="group flex w-full flex-col rounded-md border-border bg-primary/10 p-4"
        >
          {/* Image and name desktop */}
          <div className="mb-4 hidden gap-4 sm:flex">
            <img
              src={tool.image}
              alt={tool.name}
              className="size-20 rounded-md"
            />
            <div className="flex w-full flex-col">
              <div className="mb-2 flex flex-col">
                <div className="flex justify-between">
                  <span className="w-fit cursor-pointer text-2xl underline-offset-1 hover:underline">
                    {tool.name}
                  </span>

                  <div className="mb-2 flex gap-4">
                    {userData?.user && (
                      <Button
                        className="relative flex w-full items-center justify-center gap-2"
                        variant={"secondary"}
                        onClick={favoritesButtonClicked}
                      >
                        <span
                          className={cn(
                            addToFavoritesMutation.isPending ||
                              removeFromFavoritesMutation.isPending
                              ? "opacity-0"
                              : "opacity-100",
                            "flex items-center gap-2",
                          )}
                        >
                          <Bookmark className="size-4" />

                          {isFavorite ? "Remove" : "Save"}
                        </span>

                        {(addToFavoritesMutation.isPending ||
                          removeFromFavoritesMutation.isPending) && (
                          <Loader2 className="absolute size-4 animate-spin" />
                        )}
                      </Button>
                    )}

                    <a
                      href={tool.url}
                      target="_blank"
                      className={cn(buttonVariants(), "flex gap-2")}
                      onClick={() => {
                        tryItNowTrackingMutation.mutate({
                          id: tool.id,
                          tryItNowClicks: true,
                        });
                      }}
                    >
                      <span>Try it now</span>
                      <ExternalLink className="size-4" />
                    </a>
                  </div>
                </div>
                <span className="text-muted-foreground">
                  {tool.description}
                </span>
              </div>

              {/* Rating */}
              <div className="mb-4 flex items-center gap-1 text-primary">
                <Star className="size-5 fill-yellow-500 text-yellow-500" />
                <span className="text-sm">
                  {Number(tool.rating).toFixed(1)}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-4">
                {tags.map((tag) => (
                  <Badge key={tag.name} className="cursor-pointer">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Image and name mobile */}
          <div className="mb-4 flex flex-col gap-4 sm:hidden">
            <div className="flex gap-4">
              <img
                src={tool.image}
                alt={tool.name}
                className="size-20 rounded-md"
              />
              <div className="flex w-full flex-col">
                <div className="mb-2 flex flex-col">
                  <div className="flex justify-between">
                    <span className="w-fit cursor-pointer text-2xl underline-offset-1 hover:underline">
                      {tool.name}
                    </span>
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-4 flex items-center gap-1 text-primary">
                  <Star className="size-5 fill-yellow-500 text-yellow-500" />
                  <span className="text-sm">
                    {Number(tool.rating).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-4">
              {tags.map((tag) => (
                <Badge key={tag.name} className="cursor-pointer">
                  {tag.name}
                </Badge>
              ))}
            </div>

            <span className="text-muted-foreground">{tool.description}</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="group flex w-full flex-col space-y-2 rounded-md border-border bg-primary/10 p-4">
          <span className="text-xl">Pricing</span>

          <div className="flex w-full gap-4">
            <span>Model</span>
            <span className="text-muted-foreground">
              {getPricing(tool.pricing)}
            </span>
          </div>
        </div>

        <span className="self-start text-2xl">Reviews</span>

        {/* Write a review */}
        <div className="group flex w-full flex-col space-y-4 rounded-md border-border bg-primary/10 p-4">
          <span className="text-xl">Write a Review</span>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Stars */}
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "size-5 cursor-pointer",
                      star <= rating
                        ? "fill-yellow-500 text-yellow-500"
                        : "fill-muted text-muted",
                    )}
                    onClick={() => form.setValue("rating", star)}
                  />
                ))}
              </div>

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        className="content"
                        placeholder="Optionally, share your experience..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!userData?.user ? (
                <Button
                  onClick={() => {
                    authClient.signIn.social({
                      provider: "google",
                      callbackURL: window.location.href,
                    });
                  }}
                  type="button"
                >
                  Sign in to submit
                </Button>
              ) : (
                <Button
                  disabled={reviewMutation.isPending}
                  type="submit"
                  className="relative flex items-center justify-center"
                >
                  <span
                    className={cn(
                      reviewMutation.isPending ? "opacity-0" : "opacity-100",
                    )}
                  >
                    Submit
                  </span>

                  {reviewMutation.isPending && (
                    <Loader2 className="absolute size-4 animate-spin" />
                  )}
                </Button>
              )}
            </form>
          </Form>
        </div>

        {/* Reviews */}
        {reviews.map((review) => (
          <UserReview
            key={review.review.id}
            review={review.review}
            user={review.user}
          />
        ))}

        {/* Pagination */}
        {reviewsCount > 0 && (
          <PaginationBar
            page={page ?? 1}
            totalPages={totalPages}
            pages={pages}
            showLeftEllipsis={showLeftEllipsis}
            showRightEllipsis={showRightEllipsis}
            setPage={setPage}
          />
        )}
      </div>
    </div>
  );
}

function UserReview({
  review,
  user,
}: {
  review: Review;
  user: { name: string };
}) {
  const router = useRouter();
  const { data: userData } = authClient.useSession();
  const { data: voteData, refetch: refetchVotes } =
    api.reviews.fetchVotesMadeBySelf.useQuery({
      toolId: review.toolId,
    });

  const adminDeleteMutation = api.reviews.adminDelete.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  const deleteReviewMutation = api.reviews.delete.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  const rateReviewMutation = api.reviews.rate.useMutation({
    onSuccess: () => {
      router.refresh();
      refetchVotes();
    },
  });

  const isAdmin = useMemo(() => {
    if (!userData?.user) return false;
    return userData.user.role === "admin";
  }, [userData]);

  return (
    <div
      key={review.id}
      className="group flex w-full flex-col space-y-2 rounded-md border-border bg-primary/10 p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>{user.name}</span>

          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "size-4",
                  star <= review.rating
                    ? "fill-yellow-500 text-yellow-500"
                    : "fill-muted text-muted",
                )}
              />
            ))}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className={buttonVariants({ variant: "ghost", size: "icon" })}>
              <EllipsisVertical className="size-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {}}>
              <Flag className="size-4" />
              <span>Report</span>
            </DropdownMenuItem>
            {userData?.user && userData.user.id === review.userId && (
              <DropdownMenuItem
                onClick={() => {
                  adminDeleteMutation.mutate({ reviewId: review.id });
                }}
              >
                <Trash className="size-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            )}
            {isAdmin && (
              <DropdownMenuItem
                onClick={() => {
                  adminDeleteMutation.mutate({ reviewId: review.id });
                }}
              >
                <Trash className="size-4" />
                <span>Admin Delete</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* content */}
      <span className="text-foreground/70">{review.content}</span>

      {/* footer */}
      <div className="flex items-center justify-between text-muted-foreground">
        {/* Rate */}
        <div className="flex gap-2">
          <div
            className={cn(
              "flex items-center gap-1",
              voteData?.votes.find(
                (v) => v.reviewId === review.id && v.upvote,
              ) && "text-primary",
            )}
          >
            <ThumbsUp
              className="size-4 cursor-pointer hover:text-primary"
              onClick={() => {
                rateReviewMutation.mutate({
                  reviewId: review.id,
                  upvote: true,
                });
              }}
            />
            <span className="pt-px">{review.upvotes}</span>
          </div>
          <div
            className={cn(
              "flex items-center gap-1",
              voteData?.votes.find(
                (v) => v.reviewId === review.id && !v.upvote,
              ) && "text-primary",
            )}
          >
            <ThumbsDown
              className="size-4 cursor-pointer hover:text-primary"
              onClick={() => {
                rateReviewMutation.mutate({
                  reviewId: review.id,
                  upvote: false,
                });
              }}
            />
            <span className="pt-px">{review.downvotes}</span>
          </div>
        </div>

        {/* time */}
        <span className="text-sm text-muted-foreground">
          {`${formatDistanceToNow(new Date(review.createdAt))} ago`}
        </span>
      </div>
    </div>
  );
}
