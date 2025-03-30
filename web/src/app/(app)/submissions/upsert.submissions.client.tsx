"use client";

import { FileInput } from "@/app/_components/file-input";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { env } from "@/env";
import { useAreYouSure } from "@/hooks/use-are-you-sure";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tag, Tool } from "@prisma/client";
import { Image, Loader2, Monitor } from "lucide-react";
import millify from "millify";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({
  name: z.string(),
  description: z.string(),
  url: z.string().url(),
  tags: z.array(z.string()),
  logoImageUrl: z.string().url(),
  screenshotUrl: z.string().url(),
  pricing: z.string(),
  id: z.string().uuid().optional(),
});

export type SubmissionsUpsertPageProps = {
  tool?: Tool;
  tags?: Tag[];
};

export function SubmissionsUpsertPage({
  tool,
  tags = [],
}: SubmissionsUpsertPageProps) {
  const router = useRouter();
  const [tagSearch, setTagSearch] = useState("");
  const [showTopTags, setShowTopTags] = useState(false);
  const tagSearchQuery = api.tags.search.useQuery(
    {
      query: tagSearch,
    },
    {
      refetchOnWindowFocus: false,
      enabled: tagSearch.length > 1 || showTopTags,
    },
  );
  const { AreYouSure, setShowAreYouSure } = useAreYouSure({});

  const deleteToolMutation = api.tools.delete.useMutation({
    onSuccess: () => {
      router.push("/submissions");
    },
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: tool
      ? {
          name: tool.name,
          description: tool.description,
          url: tool.url,
          tags: tags.map((t) => t.name),
          logoImageUrl: tool.logoImageUrl ?? undefined,
          screenshotUrl: tool.screenshotUrl ?? undefined,
          pricing: tool.pricing,
          id: tool.id,
        }
      : {
          name: "",
          description: "",
          url: "",
          tags: [],
          logoImageUrl: "",
          screenshotUrl: "",
        },
  });

  const submit = api.tools.upsert.useMutation({
    onSuccess: () => {
      router.push("/submissions");
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    submit.mutate(data);
  }
  const formTags = form.watch("tags");

  function addTag(tag: string) {
    // check if tag already exists
    if (formTags.includes(tag)) return;
    // check if there are already 3 tags
    if (formTags.length >= 3) return;

    form.setValue("tags", [...formTags, tag]);
  }
  return (
    <div className="flex flex-col items-center">
      <AreYouSure
        title="Are you sure?"
        description="This action cannot be undone."
        onConfirm={async () => {
          if (!tool) return;
          deleteToolMutation.mutate({ id: tool.id });
        }}
        onCancel={async () => {
          setShowAreYouSure(false);
        }}
      />
      <div className="flex w-full max-w-3xl flex-col justify-center space-y-6 p-4">
        <div className="flex w-full flex-col gap-6">
          {/* Back Button */}
          <BackButton link="/submissions" label="Back to Tools" />

          <div className="flex flex-col gap-2">
            <span className="text-2xl font-semibold">Submit Your AI Tool</span>

            <span className="text-muted-foreground">
              Share your AI tool with our community and reach thousands of
              potential users.
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
                    <FormLabel>Tool Name*</FormLabel>

                    <FormControl>
                      <Input
                        className="name"
                        placeholder="e.g. CopyAI, Midjourney"
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
                        placeholder="Describe what you're AI does in 1-2 sentences."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL*</FormLabel>

                    <FormControl>
                      <Input
                        className=""
                        placeholder="https://yourtool.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Categories */}
            <div className="flex w-full flex-col space-y-6 rounded-md bg-primary/5 p-4">
              <div className="flex w-full flex-col">
                <span className="text-muted-foreground">Categories*</span>
                <span className="text-muted-foreground/70">
                  Select up to 3 categories that also apply to your tool. (
                  {3 - formTags.length} remaining)
                </span>
              </div>

              {formTags.length > 0 && (
                <>
                  <div className="flex flex-wrap gap-4">
                    {formTags.map((s, i) => {
                      return (
                        <Badge
                          key={s + i}
                          onClick={() => {
                            if (formTags.includes(s)) {
                              const newTags = formTags.filter((t) => t !== s);
                              form.setValue("tags", newTags);
                            } else {
                              addTag(s);
                            }
                          }}
                          variant={
                            formTags.includes(s) ? "default" : "secondary"
                          }
                          className={cn("cursor-pointer")}
                        >
                          {s}
                        </Badge>
                      );
                    })}
                  </div>
                </>
              )}

              <div className="flex w-full flex-col gap-4">
                <Input
                  className="h-12 w-full px-4"
                  value={tagSearch}
                  placeholder="Search for categories"
                  onChange={(e) => {
                    setTagSearch(e.target.value);
                  }}
                />
              </div>

              <div className="flex w-full flex-col space-y-0">
                {tagSearch.length > 1 &&
                  !tagSearchQuery.data?.tags.find(
                    (tag) => tag.name === tagSearch,
                  ) && (
                    <div
                      onClick={() => {
                        setTagSearch("");
                        addTag(tagSearch);
                      }}
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-sm p-2 text-muted-foreground hover:bg-primary/10",
                        formTags.includes(tagSearch) &&
                          "cursor-not-allowed bg-primary/5 text-muted-foreground",
                      )}
                    >
                      <span className="capitalize underline-offset-2 hover:underline">
                        Create new tag: {tagSearch}
                      </span>
                    </div>
                  )}
                {tagSearchQuery.data &&
                  tagSearchQuery.data?.tags.length > 0 && (
                    <>
                      {tagSearchQuery.data?.tags.map((tag) => (
                        <div
                          onClick={() => {
                            setTagSearch("");
                            addTag(tag.name);
                          }}
                          key={tag.name}
                          className={cn(
                            "flex cursor-pointer items-center justify-between rounded-sm p-2 hover:bg-primary/10",
                            formTags.includes(tag.name) &&
                              "cursor-not-allowed bg-primary/5 text-muted-foreground",
                          )}
                        >
                          <span className="capitalize">{tag.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {millify(tag.uses)}
                          </span>
                        </div>
                      ))}
                    </>
                  )}

                {tagSearchQuery.isPending && tagSearch.length > 0 && (
                  <div className="flex h-full w-full items-center justify-center p-6">
                    <Loader2 className="size-4 animate-spin" />
                  </div>
                )}

                {tagSearch.length < 1 && !showTopTags && (
                  <div className="flex">
                    <span
                      className="cursor-pointer text-muted-foreground underline-offset-1 hover:underline"
                      onClick={() => setShowTopTags(true)}
                    >
                      For insperation, click here to show the most used tags
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Images */}
            <div className="flex w-full flex-col space-y-4 rounded-md bg-primary/5 p-4">
              <span className="text-xl">Images</span>

              <div className="flex w-full flex-col">
                <span className="text-muted-foreground">Tool Logo*</span>
              </div>

              <FileInput
                text={"Drag and drop your logo here"}
                subtext={"PNG, JPG or SVG (max. 2MB)"}
                icon={<Image />}
                previewUrl={tool?.logoImageUrl}
                maxSize={2 * 1024 * 1024}
                onImageUpload={({ file, id }) => {
                  form.setValue(
                    "logoImageUrl",
                    `${env.NEXT_PUBLIC_S3_IMAGE_URL}/${id}`,
                  );
                }}
              />

              <div></div>

              <div className="flex w-full flex-col">
                <span className="text-muted-foreground">
                  Homepage Screenshot*
                </span>
              </div>

              <FileInput
                text={"Drag and drop your homepage screenshot"}
                subtext={"PNG or JPG (min. 1280x720px, max. 5MB)"}
                icon={<Monitor />}
                maxSize={5 * 1024 * 1024}
                previewUrl={tool?.screenshotUrl}
                onImageUpload={({ file, id }) => {
                  form.setValue(
                    "screenshotUrl",
                    `${env.NEXT_PUBLIC_S3_IMAGE_URL}/${id}`,
                  );
                }}
              />
            </div>

            {/* Pricing */}
            <div className="flex w-full flex-col space-y-6 rounded-md bg-primary/5 p-4">
              <span className="text-xl">Pricing</span>
              <FormField
                control={form.control}
                name="pricing"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="free" />
                          </FormControl>
                          <FormLabel className="font-normal">Free</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="free-paid" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Both free and paid plans
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="paid" />
                          </FormControl>
                          <FormLabel className="font-normal">Paid</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex w-full justify-end">
              {tool && (
                <Button
                  variant="destructive"
                  className="mr-4"
                  type="button"
                  disabled={deleteToolMutation.isPending}
                  size={"lg"}
                  onClick={() => {
                    setShowAreYouSure(true);
                  }}
                >
                  <span
                    className={cn(
                      deleteToolMutation.isPending
                        ? "opacity-0"
                        : "opacity-100",
                    )}
                  >
                    Delete
                  </span>

                  {deleteToolMutation.isPending && (
                    <Loader2 className="absolute size-4 animate-spin" />
                  )}
                </Button>
              )}

              <Button
                disabled={submit.isPending}
                type="submit"
                size={"lg"}
                className="relative flex items-center justify-center"
              >
                <span
                  className={cn(submit.isPending ? "opacity-0" : "opacity-100")}
                >
                  Submit
                </span>

                {submit.isPending && (
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
