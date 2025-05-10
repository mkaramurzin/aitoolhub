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
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({
  email: z.string().email(),
});

export default function AiNewsPage() {
  const submit = api.waitlist.join.useMutation({
    onSuccess: () => {
      setSuccess(true);
    },
  });

  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    submit.mutate(data);
  }

  return (
    <div className="flex h-dvh w-dvw flex-col items-center justify-center p-6">
      <div className="flex w-full flex-col items-center justify-center space-y-4 sm:w-[400px]">
        {/* Logo */}
        <Image
          src="/AiToolHubTransparent.png"
          alt="AiToolHub Logo"
          width={150}
          height={150}
        />
        {/* Name */}
        <h1 className="text-3xl font-bold">AiToolHub</h1>

        <span className="text-muted-foreground">
          The #1 AI newsletter, made by humans
        </span>
        {/* Email Capture Form */}
        <div className="mt-8 w-full text-center">
          {!success ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex w-full items-start justify-start gap-2"
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
                    className={cn(
                      submit.isPending ? "opacity-0" : "opacity-100",
                    )}
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
            <span className="text-green-500">Success, stay tuned!</span>
          )}
        </div>
      </div>
    </div>
  );
}
