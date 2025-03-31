"use client";

import { FileInput } from "@/app/_components/file-input";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { env } from "@/env";
import { useAreYouSure } from "@/hooks/use-are-you-sure";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Collection, Review, Tool } from "@prisma/client";
import { Image, Loader2, Star, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

export type UpsertCollectionsClientPageProps = {
  collection?: Collection;
  tools?: {
    tool: Tool;
    review?: Review;
  }[];
};

const FormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  description: z.string().min(1).max(255),
  image: z.string().url(),
  tools: z.array(
    z.object({
      toolId: z.string().uuid(),
      image: z.string().url().optional(),
      name: z.string().optional(),
      description: z.string().optional(),
      review: z.object({
        reviewId: z.string().uuid().optional(),
        rating: z.number().min(1).max(5),
        content: z.string(),
      }),
    }),
  ),
});

function UpsertCollectionsClientPage({
  collection,
  tools,
}: UpsertCollectionsClientPageProps) {
  const router = useRouter();
  const { AreYouSure, setShowAreYouSure } = useAreYouSure({});
  const [query, setQuery] = useState("");
  const upsertCollectionMutation = api.tools.collections.upsert.useMutation({
    onSuccess: () => {
      router.push("/collections");
    },
  });

  const deleteCollectionMutation = api.tools.collections.delete.useMutation({
    onSuccess: () => {
      router.push("/collections");
    },
  });

  const toolsQuery = api.tools.fetchAll.useQuery(
    {
      page: 1,
      take: 10,
      magicSearch: false,
      query,
      searchHistory: false,
    },
    {
      enabled: query.length > 0,
    },
  );

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues:
      collection && tools
        ? {
            ...collection,
            tools: tools.map((tool) => {
              return {
                toolId: tool.tool.id,
                image: tool.tool.image,
                name: tool.tool.name,
                description: tool.tool.description,
                review: tool.review
                  ? {
                      reviewId: tool.review.id,
                      rating: tool.review.rating,
                      content: tool.review.content,
                    }
                  : {
                      rating: 5,
                      content: "",
                    },
              };
            }),
          }
        : {},
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    upsertCollectionMutation.mutate(data);
  }

  const {
    fields: formTools,
    append: appendTool,
    remove: removeTool,
  } = useFieldArray({
    name: "tools",
    control: form.control,
  });
  const watchedTools = form.watch("tools");

  return (
    <div className="flex flex-col items-center">
      <AreYouSure
        title="Are you sure?"
        description="This action cannot be undone."
        onConfirm={async () => {
          if (!collection) return;
          deleteCollectionMutation.mutate({ id: collection.id });
        }}
        onCancel={async () => {
          setShowAreYouSure(false);
        }}
      />
      <div className="flex w-full max-w-3xl flex-col justify-center space-y-6 p-4">
        <div className="flex w-full flex-col gap-6">
          {/* Back Button */}
          <BackButton link="/collections" label="Back to Collections" />

          <div className="flex flex-col gap-2">
            <span className="text-2xl font-semibold">
              {collection ? "Update Collection" : "Create Collection"}
            </span>

            <span className="text-muted-foreground">
              Create a new collection of tools. You can add tools to this
              collection later.
            </span>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (e) => {
              console.log(form.getValues());
              console.log(e);
            })}
            className="space-y-4"
          >
            {/* Name, description, url */}
            <div className="flex w-full flex-col space-y-6 rounded-md bg-primary/5 p-4">
              <span className="text-xl">Basic Information</span>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Collection Name*</FormLabel>

                    <FormControl>
                      <Input
                        className="name"
                        placeholder="Best Tools for Developers"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description*</FormLabel>

                    <FormControl>
                      <Textarea
                        className="description"
                        placeholder="Describe this collection."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Images */}
            <div className="flex w-full flex-col space-y-4 rounded-md bg-primary/5 p-4">
              <span className="text-xl">Images</span>

              <div className="flex w-full flex-col">
                <span className="text-muted-foreground">Collection Image*</span>
              </div>

              <FileInput
                text={"Drag and drop your logo here"}
                subtext={"PNG, JPG or SVG (max. 2MB)"}
                icon={<Image />}
                previewUrl={collection?.image}
                maxSize={10 * 1024 * 1024}
                onImageUpload={({ file, id }) => {
                  form.setValue(
                    "image",
                    `${env.NEXT_PUBLIC_S3_IMAGE_URL}/${id}`,
                  );
                }}
              />
            </div>

            {/* Tools */}
            <div className="flex w-full flex-col space-y-6 rounded-md bg-primary/5 p-4">
              <span className="text-xl">Tools</span>

              <div className="flex w-full flex-col gap-4">
                <Input
                  className="h-12 w-full px-4"
                  value={query}
                  placeholder="Search for tools to add"
                  onChange={(e) => {
                    setQuery(e.target.value);
                  }}
                />
              </div>

              <div className="flex w-full flex-col space-y-0">
                {toolsQuery.data && toolsQuery.data?.tools.length > 0 && (
                  <>
                    {toolsQuery.data?.tools.map((tool) => {
                      const isToolInCollection = formTools.some((ft) => {
                        return ft.toolId === tool.id;
                      });

                      return (
                        <div
                          onClick={() => {
                            if (isToolInCollection) return;
                            appendTool({
                              toolId: tool.id,
                              image: tool.image,
                              name: tool.name,
                              description: tool.description,
                              review: {
                                rating: 5,
                                content: "",
                              },
                            });
                          }}
                          key={tool.name}
                          className={cn(
                            "flex cursor-pointer items-start justify-start gap-4 rounded-sm p-2 hover:bg-primary/10",
                            isToolInCollection &&
                              "cursor-not-allowed bg-primary/5 text-muted-foreground",
                          )}
                        >
                          <img
                            src={tool.image}
                            alt=""
                            className="size-16 rounded-md"
                          />

                          <div className="flex flex-col">
                            <span className="">{tool.name}</span>
                            <span className="line-clamp-2 text-sm text-muted-foreground">
                              {tool.description}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {toolsQuery.isPending && query.length > 0 && (
                  <div className="flex h-full w-full items-center justify-center p-6">
                    <Loader2 className="size-4 animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex w-full flex-col space-y-2">
                <span className="text-muted-foreground">
                  Selected Tools ({formTools.length})
                </span>

                <div className="flex w-full flex-col gap-2">
                  {formTools.map((tool, index) => {
                    return (
                      <div
                        key={tool.name}
                        className={cn("flex flex-col gap-2 rounded-sm p-2")}
                      >
                        <div className="flex items-start justify-start gap-4">
                          <img
                            src={tool.image}
                            alt=""
                            className="size-16 rounded-md"
                          />

                          <div className="flex w-full flex-col">
                            <span className="flex w-full items-center justify-between">
                              <span>{tool.name}</span>
                              <span
                                className="cursor-pointer rounded-md p-1 hover:bg-secondary/40"
                                onClick={() => {
                                  removeTool(index);
                                }}
                              >
                                <Trash className="size-4 text-destructive" />
                              </span>
                            </span>
                            <span className="line-clamp-2 text-sm text-muted-foreground">
                              {tool.description}
                            </span>
                          </div>
                        </div>

                        {/* Review */}
                        {tool.review && (
                          <div className="flex w-full flex-col gap-2">
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={cn(
                                    "size-5 cursor-pointer",
                                    star <=
                                      (watchedTools[index]?.review?.rating ?? 0)
                                      ? "fill-yellow-500 text-yellow-500"
                                      : "fill-muted text-muted",
                                  )}
                                  onClick={() =>
                                    form.setValue(
                                      `tools.${index}.review.rating`,
                                      star,
                                    )
                                  }
                                />
                              ))}
                            </div>

                            <FormField
                              control={form.control}
                              name={`tools.${index}.review.content`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Review*</FormLabel>

                                  <FormControl>
                                    <Textarea
                                      className="review"
                                      placeholder="e.g. This tool is amazing!"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex w-full justify-end">
              {collection && (
                <Button
                  variant="destructive"
                  className="mr-4"
                  type="button"
                  disabled={deleteCollectionMutation.isPending}
                  size={"lg"}
                  onClick={() => {
                    setShowAreYouSure(true);
                  }}
                >
                  <span
                    className={cn(
                      deleteCollectionMutation.isPending
                        ? "opacity-0"
                        : "opacity-100",
                    )}
                  >
                    Delete
                  </span>

                  {deleteCollectionMutation.isPending && (
                    <Loader2 className="absolute size-4 animate-spin" />
                  )}
                </Button>
              )}

              <Button
                disabled={upsertCollectionMutation.isPending}
                type="submit"
                size={"lg"}
                className="relative flex items-center justify-center"
              >
                <span
                  className={cn(
                    upsertCollectionMutation.isPending
                      ? "opacity-0"
                      : "opacity-100",
                  )}
                >
                  Submit
                </span>

                {upsertCollectionMutation.isPending && (
                  <Loader2 className="absolute size-4 animate-spin" />
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
export default UpsertCollectionsClientPage;
