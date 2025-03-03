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

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({
  email: z.string().email(),
});

export type EmailCaptureProps = {};

export function EmailCapture(props: EmailCaptureProps) {
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
      {!success ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-80 items-start justify-start gap-2"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormControl>
                    <Input
                      type="email"
                      className="content flex h-10 w-full"
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
          </form>
        </Form>
      ) : (
        <span className="">Success, stay tuned!</span>
      )}
    </>
  );
}
