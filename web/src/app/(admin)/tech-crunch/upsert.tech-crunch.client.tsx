"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { env } from "@/env";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IngestRedditData,
  IngestXData,
  TechCrunch,
  TechCrunchBreakingNews,
  TechCrunchIngestRedditData,
  TechCrunchIngestXData,
  TechCrunchSponsor,
  TechCrunchSummary,
  TechCrunchTool,
  Tool,
} from "@prisma/client";
import { render } from "@react-email/render";
import { Loader2, Plus, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import MarketingEmail from "../../../../emails/marketing-email";

export type TechCrunchIngestXDataWithRelations = TechCrunchIngestXData & {
  IngestXData: IngestXData;
};

export type TechCrunchSponsorWithRelations = TechCrunchSponsor & {
  Tool: Tool;
};

export type TechCrunchIngestRedditDataWithRelations =
  TechCrunchIngestRedditData & {
    IngestRedditData: IngestRedditData;
  };

export type TechCrunchWithRelations = TechCrunch & {
  TechCrunchSponsor: TechCrunchSponsorWithRelations[];
  TechCrunchSummary: TechCrunchSummary[];
  TechCrunchTool: TechCrunchTool[];
  TechCrunchBreakingNews: TechCrunchBreakingNews[];
  TechCrunchIngestXData: TechCrunchIngestXDataWithRelations[];
  TechCrunchIngestRedditData: TechCrunchIngestRedditDataWithRelations[];
};

export type TechCrunchUpsertPageProps = {
  techCrunch?: TechCrunchWithRelations;
};

const FormSchema = z.object({
  title: z.string(),
  subject: z.string(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  id: z.string().uuid().optional(),
  sponsors: z.array(
    z.object({
      id: z.string().uuid().optional(),
      toolId: z.string(),
      name: z.string().optional(),
      image: z.string().optional(),
      description: z.string().optional(),
    }),
  ),
  summaries: z.array(
    z.object({
      id: z.string().uuid().optional(),
      summary: z.string(),
    }),
  ),
  tools: z.array(
    z.object({
      id: z.string().uuid().optional(),
      name: z.string(),
      description: z.string(),
    }),
  ),
  breakingNews: z.array(
    z.object({
      id: z.string().uuid().optional(),
      title: z.string(),
      description: z.string(),
      url: z.string(),
    }),
  ),
  tweets: z.array(
    z.object({
      tweetId: z.string(),
      profilePicture: z.string(),
      author: z.string(),
      handle: z.string(),
      content: z.string(),
      url: z.string(),
      retweetCount: z.number(),
      replyCount: z.number(),
      likeCount: z.number(),
      image: z.string().url().optional(),
    }),
  ),
  redditPosts: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      permalink: z.string().url(),
      subreddit: z.string(),
      author: z.string(),
      score: z.number(),
      numComments: z.number(),
      image: z.string().optional(),
    }),
  ),
});

export function TechCrunchUpsertPage({
  techCrunch,
}: TechCrunchUpsertPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic");
  const [query, setQuery] = useState("");

  const [renderedEmailHtml, setRenderedEmailHtml] = useState<string | null>(
    null,
  );

  const toolsQuery = api.tools.fetchAll.useQuery(
    {
      page: 1,
      take: 10,
      magicSearch: false,
      query,
      searchHistory: false,
    },
    {
      enabled: query.length > 0 && activeTab === "sponsors",
    },
  );

  const fetchTweetsQuery = api.ingest.fetchAll.useQuery();
  const fetchRedditPostsQuery = api.ingest.redditFetchAll.useQuery();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: techCrunch
      ? {
          title: techCrunch.title,
          subject: techCrunch.subject,
          status: techCrunch.status,
          id: techCrunch.id,
          sponsors: techCrunch.TechCrunchSponsor.map((sponsor) => ({
            id: sponsor.id,
            toolId: sponsor.toolId,
            name: sponsor.Tool.name,
            image: sponsor.Tool.image,
            description: sponsor.Tool.description,
          })),
          summaries: techCrunch.TechCrunchSummary.map((summary) => ({
            id: summary.id,
            summary: summary.summary,
          })),
          tools: techCrunch.TechCrunchTool.map((tool) => ({
            id: tool.id,
            name: tool.name,
            description: tool.description,
          })),
          breakingNews: techCrunch.TechCrunchBreakingNews.map((news) => ({
            id: news.id,
            title: news.title,
            description: news.description,
            url: news.url,
          })),
          tweets: techCrunch.TechCrunchIngestXData.flatMap(
            (tweet) => tweet.IngestXData,
          ).map((tweet) => ({
            tweetId: tweet.id,
            profilePicture: tweet.author
              ? // @ts-ignore
                tweet.author.profilePicture
              : "None",
            // @ts-ignore
            author: tweet.author ? tweet.author.name : "None",
            // @ts-ignore
            handle: tweet.author ? tweet.author.userName : "None",
            content: tweet.text,
            url: tweet.url,
            retweetCount: tweet.retweetCount,
            replyCount: tweet.replyCount,
            likeCount: tweet.likeCount,
            image:
              typeof tweet.extendedEntities === "object" &&
              tweet.extendedEntities !== null &&
              "media" in tweet.extendedEntities &&
              Array.isArray((tweet.extendedEntities as any).media) &&
              (tweet.extendedEntities as any).media.length > 0
                ? (tweet.extendedEntities as any).media[0].media_url_https
                : undefined,
          })),
          redditPosts: techCrunch.TechCrunchIngestRedditData.flatMap(
            (post) => post.IngestRedditData,
          ).map((post) => ({
            id: post.id,
            title: post.title,
            permalink: post.permalink,
            subreddit: post.subreddit,
            author: post.author,
            score: post.score,
            numComments: post.numComments,
            image: post.image ?? undefined,
          })),
        }
      : {
          title: "",
          subject: "",
          status: "DRAFT",
          sponsors: [],
          summaries: [],
          tools: [],
          breakingNews: [],
          tweets: [],
          redditPosts: [],
        },
  });

  const {
    fields: sponsorFields,
    append: addSponsor,
    remove: removeSponsor,
  } = useFieldArray({ control: form.control, name: "sponsors" });

  const {
    fields: summaryFields,
    append: addSummary,
    remove: removeSummary,
  } = useFieldArray({ control: form.control, name: "summaries" });

  const {
    fields: toolFields,
    append: addTool,
    remove: removeTool,
  } = useFieldArray({ control: form.control, name: "tools" });

  const {
    fields: breakingNewsFields,
    append: addBreakingNews,
    remove: removeBreakingNews,
  } = useFieldArray({ control: form.control, name: "breakingNews" });

  const {
    fields: tweetFields,
    append: addTweet,
    remove: removeTweet,
  } = useFieldArray<z.infer<typeof FormSchema>, "tweets">({
    control: form.control,
    name: "tweets",
  });

  const {
    fields: redditFields,
    append: addRedditPost,
    remove: removeRedditPost,
  } = useFieldArray<z.infer<typeof FormSchema>, "redditPosts">({
    control: form.control,
    name: "redditPosts",
  });

  const submit = api.techCrunch.upsert.useMutation({
    onSuccess: () => {
      router.push("/tech-crunch");
    },
    onError: (error) => {
      toast(error.message);
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    submit.mutate(data);
  }

  useEffect(() => {
    const renderEmail = async () => {
      const html = await render(
        <MarketingEmail
          id={techCrunch?.id ?? ""}
          tweets={form.watch("tweets")}
          redditPosts={form.watch("redditPosts")}
          baseUrl={env.NEXT_PUBLIC_BASE_URL}
          previewText={form.watch("subject")}
          title={form.watch("title")}
          subject={form.watch("subject")}
          sponsors={form.watch("sponsors").map((sponsor) => ({
            ...sponsor,
            name: sponsor.name || "",
            logo: sponsor.image || "", // Use actual image for logo
            url: "", // We don't have tool URL in this data, keep empty for now
          }))}
          overview={form.watch("summaries").map((summary) => summary.summary)}
          tools={form.watch("tools")}
          breakingNews={form.watch("breakingNews")}
        />,
      );
      setRenderedEmailHtml(html);
    };

    if (activeTab === "preview") {
      renderEmail();
    } else {
      setRenderedEmailHtml(null); // Clear preview when not on preview tab
    }
  }, [
    activeTab,
    form.watch("subject"),
    form.watch("title"),
    form.watch("sponsors"),
    form.watch("summaries"),
    form.watch("tools"),
    form.watch("breakingNews"),
    form.watch("tweets"),
    form.watch("redditPosts"),
  ]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full max-w-3xl flex-col justify-center space-y-6 p-4">
        <div className="flex w-full flex-col gap-6">
          <BackButton link="/tech-crunch" label="Back to Tech Crunch" />

          <div className="flex flex-col gap-2">
            <span className="text-2xl font-semibold">Submit Tech Crunch</span>
            <span className="text-muted-foreground">
              Share your Tech Crunch article with the community.
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs
              defaultValue="basic"
              className="w-full"
              onValueChange={setActiveTab}
            >
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
                <TabsTrigger value="summaries">Summaries</TabsTrigger>
                <TabsTrigger value="tools">Tools</TabsTrigger>
                <TabsTrigger value="breaking-news">Breaking News</TabsTrigger>
                <TabsTrigger value="tweets">Tweets</TabsTrigger>
                <TabsTrigger value="reddit-posts">Reddit Posts</TabsTrigger>
                <TabsTrigger value="preview">Preview Email</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Enter the core details about this Tech Crunch article
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title*</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter the title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject*</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter the subject" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel>Status*</FormLabel>
                            {field.value === "DRAFT" && (
                              <Badge variant="secondary">Draft</Badge>
                            )}
                            {field.value === "PUBLISHED" && (
                              <Badge>Published</Badge>
                            )}
                          </div>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="DRAFT">Draft</SelectItem>
                              <SelectItem value="PUBLISHED">
                                Published
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sponsors" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Sponsors</CardTitle>
                    <CardDescription>
                      Add sponsors for this Tech Crunch article
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex w-full flex-col gap-4">
                      <Input
                        className="h-12 w-full px-4"
                        value={query}
                        placeholder="Search for tools to add as sponsors"
                        onChange={(e) => {
                          setQuery(e.target.value);
                        }}
                      />
                    </div>

                    {/* Search Results */}
                    <div className="flex w-full flex-col space-y-0">
                      {toolsQuery.data && toolsQuery.data?.tools.length > 0 && (
                        <>
                          <div className="mb-2 text-sm font-medium text-muted-foreground">
                            Search Results
                          </div>
                          {toolsQuery.data?.tools.map((tool) => {
                            const isToolInCollection = sponsorFields.some(
                              (ft) => {
                                return ft.toolId === tool.id;
                              },
                            );

                            return (
                              <div
                                onClick={() => {
                                  if (isToolInCollection) return;
                                  addSponsor({
                                    toolId: tool.id,
                                    name: tool.name,
                                    image: tool.image,
                                    description: tool.description,
                                  });
                                  setQuery("");
                                }}
                                key={tool.id}
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
                                  <span className="font-medium">
                                    {tool.name}
                                  </span>
                                  <span className="line-clamp-2 text-sm text-muted-foreground">
                                    {tool.description}
                                  </span>
                                  <div className="mt-2 flex items-center gap-1">
                                    <span className="text-xs text-muted-foreground">
                                      Tool ID:
                                    </span>
                                    <span className="text-xs">{tool.id}</span>
                                  </div>
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

                    {/* Selected Sponsors */}
                    <div className="flex w-full flex-col space-y-2 pt-4">
                      <span className="text-muted-foreground">
                        Selected Sponsors ({sponsorFields.length})
                      </span>

                      {sponsorFields.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <p className="text-muted-foreground">
                            No sponsors added yet
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Search for tools above to add sponsors
                          </p>
                        </div>
                      ) : (
                        <div className="flex w-full flex-col gap-2">
                          {sponsorFields.map((field, index) => (
                            <div
                              key={field.id}
                              className="flex flex-col space-y-4 rounded-md border p-4"
                            >
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium">
                                  Sponsor {index + 1}
                                </h4>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Trash className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Are you sure?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will
                                        permanently delete this sponsor.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => removeSponsor(index)}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>

                              {field.name && field.image ? (
                                <div className="flex items-start gap-4">
                                  <img
                                    src={field.image}
                                    alt=""
                                    className="size-16 rounded-md"
                                  />
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {field.name}
                                    </span>
                                    <span className="line-clamp-2 text-sm text-muted-foreground">
                                      {field.description}
                                    </span>
                                    <FormField
                                      control={form.control}
                                      name={`sponsors.${index}.toolId`}
                                      render={({ field }) => (
                                        <FormItem className="mt-2">
                                          <div className="flex items-center gap-1">
                                            <FormLabel className="text-xs text-muted-foreground">
                                              Tool ID:
                                            </FormLabel>
                                            <span className="text-xs">
                                              {field.value}
                                            </span>
                                          </div>
                                          <FormControl>
                                            <Input type="hidden" {...field} />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <FormField
                                  control={form.control}
                                  name={`sponsors.${index}.toolId`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <div className="flex items-center gap-1">
                                        <FormLabel>Tool ID</FormLabel>
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <span className="cursor-help text-muted-foreground">
                                                (?)
                                              </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>
                                                Enter the unique identifier for
                                                the tool
                                              </p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      </div>
                                      <FormControl>
                                        <Input
                                          placeholder="Enter tool ID"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="summaries" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Summaries</CardTitle>
                    <CardDescription>
                      Add summaries for this Tech Crunch article
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {summaryFields.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <p className="text-muted-foreground">
                          No summaries added yet
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => addSummary({ summary: "" })}
                          className="mt-4"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Your First Summary
                        </Button>
                      </div>
                    ) : (
                      <>
                        {summaryFields.map((field, index) => (
                          <div
                            key={field.id}
                            className="flex flex-col space-y-4 rounded-md border p-4"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">
                                Summary {index + 1}
                              </h4>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will
                                      permanently delete this summary.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => removeSummary(index)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                            <FormField
                              control={form.control}
                              name={`summaries.${index}.summary`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Summary</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Enter summary"
                                      className="min-h-[100px]"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => addSummary({ summary: "" })}
                          className="w-full"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Another Summary
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tools" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Tools</CardTitle>
                    <CardDescription>
                      Add tools for this Tech Crunch article
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {toolFields.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <p className="text-muted-foreground">
                          No tools added yet
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => addTool({ name: "", description: "" })}
                          className="mt-4"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Your First Tool
                        </Button>
                      </div>
                    ) : (
                      <>
                        {toolFields.map((field, index) => (
                          <div
                            key={field.id}
                            className="flex flex-col space-y-4 rounded-md border p-4"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">
                                Tool {index + 1}
                              </h4>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will
                                      permanently delete this tool.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => removeTool(index)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                            <div className="flex w-full flex-col items-start gap-4">
                              <div className="flex w-full flex-col">
                                <FormField
                                  control={form.control}
                                  name={`tools.${index}.name`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Name</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Enter tool name"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`tools.${index}.description`}
                                  render={({ field }) => (
                                    <FormItem className="mt-2">
                                      <FormLabel>Description</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Enter tool description"
                                          className="min-h-[100px]"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => addTool({ name: "", description: "" })}
                          className="w-full"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Another Tool
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="breaking-news" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Breaking News</CardTitle>
                    <CardDescription>
                      Add breaking news for this Tech Crunch article
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {breakingNewsFields.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <p className="text-muted-foreground">
                          No breaking news added yet
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            addBreakingNews({
                              title: "",
                              description: "",
                              url: "",
                            })
                          }
                          className="mt-4"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Your First Breaking News
                        </Button>
                      </div>
                    ) : (
                      <>
                        {breakingNewsFields.map((field, index) => (
                          <div
                            key={field.id}
                            className="flex flex-col space-y-4 rounded-md border p-4"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">
                                Breaking News {index + 1}
                              </h4>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will
                                      permanently delete this breaking news
                                      entry.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => removeBreakingNews(index)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                            <div className="flex w-full flex-col items-start gap-4">
                              <div className="flex w-full flex-col">
                                <FormField
                                  control={form.control}
                                  name={`breakingNews.${index}.title`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Title</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Enter title"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`breakingNews.${index}.description`}
                                  render={({ field }) => (
                                    <FormItem className="mt-2">
                                      <FormLabel>Description</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Enter description"
                                          className="min-h-[100px]"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`breakingNews.${index}.url`}
                                  render={({ field }) => (
                                    <FormItem className="mt-2">
                                      <FormLabel>URL</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Enter URL"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            addBreakingNews({
                              title: "",
                              description: "",
                              url: "",
                            })
                          }
                          className="w-full"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Another Breaking News
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preview" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Email Preview</CardTitle>
                    <CardDescription>
                      Preview how the marketing email will look with your
                      current data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-[800px] overflow-auto rounded-md border bg-background p-4">
                      {renderedEmailHtml ? (
                        <iframe
                          srcDoc={renderedEmailHtml}
                          style={{
                            width: "100%",
                            height: "700px",
                            border: "none",
                          }}
                          title="Email Preview"
                        />
                      ) : (
                        <div className="flex h-[700px] items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tweets" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Tweets</CardTitle>
                    <CardDescription>
                      Fetch and add tweets for this Tech Crunch article
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {fetchTweetsQuery.data &&
                      fetchTweetsQuery.data.length > 0 && (
                        <div className="flex w-full flex-col space-y-2 pt-4">
                          <span className="text-muted-foreground">
                            Fetched Tweets ({fetchTweetsQuery.data.length})
                          </span>
                          {fetchTweetsQuery.data.map((tweet) => (
                            <div
                              key={tweet.id}
                              className="flex flex-col space-y-4 rounded-md border p-4"
                            >
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium">
                                  Tweet from{" "}
                                  {(tweet.author as any)?.name || "Unknown"}
                                </h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  disabled={tweetFields.some(
                                    (field) => field.tweetId === tweet.id,
                                  )}
                                  onClick={() => {
                                    addTweet({
                                      tweetId: tweet.id,
                                      profilePicture: tweet.author
                                        ? // @ts-ignore
                                          tweet.author.profilePicture
                                        : "None",
                                      author: tweet.author
                                        ? // @ts-ignore
                                          tweet.author.name
                                        : "None",
                                      // @ts-ignore
                                      handle: tweet.author
                                        ? // @ts-ignore
                                          tweet.author.userName
                                        : "None",
                                      content: tweet.text,
                                      url: tweet.url,
                                      retweetCount: tweet.retweetCount,
                                      replyCount: tweet.replyCount,
                                      likeCount: tweet.likeCount,
                                    });
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {tweet.text}
                              </p>
                              <a
                                href={tweet.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                Read on X
                              </a>
                            </div>
                          ))}
                        </div>
                      )}

                    {tweetFields.length > 0 && (
                      <div className="flex w-full flex-col space-y-2 pt-4">
                        <span className="text-muted-foreground">
                          Selected Tweets ({tweetFields.length})
                        </span>
                        {tweetFields.map((field, index) => (
                          <div
                            key={field.id}
                            className="flex flex-col space-y-4 rounded-md border p-4"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">
                                Tweet from{" "}
                                {(field.author as any)?.name || "Unknown"}
                              </h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  removeTweet(index);
                                }}
                              >
                                <Trash className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {field.content}
                            </p>
                            <a
                              href={field.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              Read on X
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reddit-posts" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Reddit Posts</CardTitle>
                    <CardDescription>
                      Fetch and add Reddit posts for this TechCrunch article
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {fetchRedditPostsQuery.data &&
                      fetchRedditPostsQuery.data.length > 0 && (
                        <div className="flex w-full flex-col space-y-2 pt-4">
                          <span className="text-muted-foreground">
                            Fetched Reddit Posts (
                            {fetchRedditPostsQuery.data.length})
                          </span>
                          {fetchRedditPostsQuery.data.map((post) => (
                            <div
                              key={post.id}
                              className="flex flex-col space-y-4 rounded-md border p-4"
                            >
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium">
                                  r/{post.subreddit} by u/{post.author}
                                </h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  disabled={redditFields.some(
                                    (field) => field.id === post.id,
                                  )}
                                  onClick={() => {
                                    addRedditPost({
                                      id: post.id,
                                      title: post.title,
                                      permalink: post.permalink,
                                      subreddit: post.subreddit,
                                      author: post.author,
                                      score: post.score,
                                      numComments: post.numComments,
                                      image: post.image ?? undefined,
                                    });
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="text-sm text-muted-foreground font-bold">
                                Title: {post.title}
                              </p>

                              <p className="text-sm text-muted-foreground">
                                Text Body: {post.text ? post.text : "N/A"}
                              </p>

                              {post.image && (
                                <img 
                                  src={post.image}
                                  alt="Post image"
                                  className="size-20 rounded-md"
                                />
                              )}

                              <a
                                href={post.permalink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                View Post
                              </a>
                            </div>
                          ))}
                        </div>
                      )}

                    {redditFields.length > 0 && (
                      <div className="flex w-full flex-col space-y-2 pt-4">
                        <span className="text-muted-foreground">
                          Selected Reddit Posts ({redditFields.length})
                        </span>
                        {redditFields.map((field, index) => (
                          <div
                            key={field.id}
                            className="flex flex-col space-y-4 rounded-md border p-4"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">
                                r/{field.subreddit} by u/{field.author}
                              </h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  removeRedditPost(index);
                                }}
                              >
                                <Trash className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {field.title}
                            </p>
                            <a
                              href={field.permalink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              View Post
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex w-full justify-end">
              <Button
                disabled={submit.isPending}
                type="submit"
                size="lg"
                className="gap-2"
              >
                {submit.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
