"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tool } from "@prisma/client";
import { Check, Image, Loader2, Monitor } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
const FormSchema = z.object({
  name: z.string(),
  description: z.string(),
  url: z.string().url(),
  primaryTag: z.string(),
  tags: z.array(z.string()),
  logoImageId: z.string().uuid(),
  homepageScreenshotImageId: z.string().uuid(),
  toolId: z.string().uuid().optional(),
});

export type NewSubmitClientPageProps = {
  tool?: Tool;
};

export function NewSubmitClientPage({ tool }: NewSubmitClientPageProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { tags: [] },
  });

  const submit = api.tools.upsert.useMutation({
    onSuccess: () => {},
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    submit.mutate(data);
  }
  const primaryTag = form.watch("primaryTag");
  const tags = form.watch("tags");
  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full max-w-3xl flex-col justify-center space-y-6 p-4">
        <div className="flex w-full flex-col gap-6">
          {/* Back Button */}
          <BackButton link="/submit" label="Back to Tools" />

          <div className="flex flex-col gap-2">
            <span className="text-2xl font-semibold">Submit Your AI Tool</span>

            <span className="text-muted-foreground">
              Share your AI tool with our community and reach thousands of
              potential users.
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <span className="text-xl">Categories</span>

              <div className="flex w-full flex-col">
                <span className="text-muted-foreground">Primary Category*</span>
                <span className="text-muted-foreground/70">
                  Select the main category that best describes your tool.
                </span>
              </div>

              <div className="flex flex-wrap gap-4">
                {[
                  "Writing",
                  "Marketing",
                  "Content",
                  "Art",
                  "Images",
                  "Open Source",
                  "Audio",
                  "Voice",
                  "Chat",
                  "Coding",
                  "Design",
                ].map((s, i) => {
                  return (
                    <Badge
                      key={s + i}
                      onClick={() => {
                        form.setValue("primaryTag", s);
                      }}
                      variant={primaryTag === s ? "default" : "secondary"}
                      className={cn("cursor-pointer")}
                    >
                      {primaryTag === s && <Check className="mr-2 size-4" />}
                      {s}
                    </Badge>
                  );
                })}
              </div>

              {primaryTag && primaryTag.length > 0 && (
                <>
                  <div className="flex w-full flex-col">
                    <span className="text-muted-foreground">
                      Related Categories*
                    </span>
                    <span className="text-muted-foreground/70">
                      Select up to 4 related categories that also apply to your
                      tool. ({4 - tags.length} remaining)
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {[
                      "Writing",
                      "Marketing",
                      "Content",
                      "Art",
                      "Images",
                      "Open Source",
                      "Audio",
                      "Voice",
                      "Chat",
                      "Coding",
                      "Design",
                    ].map((s, i) => {
                      return (
                        <Badge
                          key={s + i}
                          onClick={() => {
                            if (tags.includes(s)) {
                              const newTags = tags.filter((t) => t !== s);
                              form.setValue("tags", newTags);
                            } else {
                              if (tags.length >= 4) return;

                              form.setValue("tags", [...tags, s]);
                            }
                          }}
                          variant={tags.includes(s) ? "default" : "secondary"}
                          className={cn("cursor-pointer")}
                        >
                          {s}
                        </Badge>
                      );
                    })}
                  </div>
                </>
              )}
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
              />
            </div>

            {/* Pricing */}
            <div className="flex w-full flex-col space-y-6 rounded-md bg-primary/5 p-4">
              <span className="text-xl">Pricing</span>
            </div>

            <div className="flex w-full justify-end">
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

function FileInput(props: { text: string; subtext: string; icon: any }) {
  return (
    <div className="flex w-full flex-col items-center justify-center space-y-6 rounded-md border border-border/60 p-10">
      <div className="flex size-20 items-center justify-center space-y-2 rounded-full bg-primary/10 text-primary/50">
        {props.icon}
      </div>
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <span className="">{props.text}</span>
        <span className="text-sm text-muted-foreground/70">
          {props.subtext}
        </span>
      </div>

      <Button type="button" variant={"secondary"}>
        Browse Files
      </Button>
    </div>
  );
}
