"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { CircleCheck, Loader2 } from "lucide-react";

const formSchema = z.object({
  prompt: z.string(),
});

export function UpdatePromptPage({ prompt }: { prompt: string }) {
  const upsertPrompt = api.keyValues.upsert.useMutation({});
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt,
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    upsertPrompt.mutate({
      key: "prompt",
      value: values.prompt,
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="h-full w-full space-y-8"
      >
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prompt</FormLabel>
              <FormControl>
                <Textarea
                  className="h-[500px]"
                  placeholder="shadcn"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={upsertPrompt.isPending}>
          {upsertPrompt.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CircleCheck className="size-4" />
          )}
        </Button>
      </form>
    </Form>
  );
}

export default UpdatePromptPage;
