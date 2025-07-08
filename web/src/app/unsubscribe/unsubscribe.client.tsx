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
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({
  email: z.string().email(),
});

export function UnsubscribePage() {
  const leaveMutation = api.waitlist.leave.useMutation({
    onSuccess: () => {
      setSuccess(true);
    },
  });
  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { email: "" },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    leaveMutation.mutate(data);
  }

  return (
    <div className="flex h-dvh w-dvw items-center justify-center">
      {!success ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col items-center gap-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="w-80">
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
              disabled={leaveMutation.isPending}
              type="submit"
              className="relative flex items-center justify-center"
            >
              <span
                className={
                  leaveMutation.isPending ? "opacity-0" : "opacity-100"
                }
              >
                Unsubscribe
              </span>
              {leaveMutation.isPending && (
                <Loader2 className="absolute size-4 animate-spin" />
              )}
            </Button>
          </form>
        </Form>
      ) : (
        <span>{`You've been unsubscribed!`}</span>
      )}
    </div>
  );
}
