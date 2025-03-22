"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";

import { Loader2, Mail, MoveRight } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({
  email: z.string().email(),
});

export type EmailCaptureProps = {};

export function SubscribeEmailCapture(props: EmailCaptureProps) {
  const submit = api.waitlist.join.useMutation({
    onSuccess: () => {
      setSuccess(true);
    },
  });

  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    submit.mutate(data);
  }
  return (
    <>
      <div className="flex w-full flex-col justify-center space-y-3">
        <div className="flex items-center text-3xl">
          <Mail className="mr-4 size-6 text-primary" strokeWidth={3} />

          <span className="text-xl text-white">Join the AI Revolution</span>
        </div>

        <span className="text-muted-foreground">
          Stay tuned for the latest AI tool, trends, and innovations. Get
          curated updates straight to your inbox.
        </span>
        <div className="flex flex-col items-center gap-2">
          {!success ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex w-full flex-col items-start justify-start gap-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col">
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  disabled={submit.isPending}
                  type="submit"
                  className="relative flex w-full items-center justify-center"
                >
                  <span
                    className={cn(
                      "flex items-center gap-2",
                      submit.isPending ? "opacity-0" : "opacity-100",
                    )}
                  >
                    <span>Subscribe</span>
                    <MoveRight className="size-4" />
                  </span>

                  {submit.isPending && (
                    <Loader2 className="absolute size-4 animate-spin" />
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <span className="">Success, stay tuned!</span>
          )}
        </div>
      </div>
    </>
  );
}
