"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react"; // new import
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const FormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export function Footer() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const submit = api.waitlist.join.useMutation({
    onSuccess: () => {
      toast("Successfully subscribed!");
      form.reset();
    },
    onError: (error: any) => {
      toast("Error subscribing.");
    },
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    submit.mutate(data);
  };

  return (
    <footer className="mt-auto w-full border-t bg-background/50 py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 md:flex-row">
        <div className="flex flex-1 justify-start gap-12">
          <div className="flex items-center gap-6">
            <Link
              href="/submissions"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Submit Tool
            </Link>
          </div>
        </div>
        <div className="flex flex-1 justify-between">
          <div className="flex w-full max-w-sm flex-col">
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex w-full items-center space-x-2"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
                {...form.register("email")}
              />
              <Button
                disabled={submit.isPending}
                type="submit"
                className="relative flex items-center justify-center"
              >
                <span
                  className={cn(
                    "flex items-center gap-2",
                    submit.isPending ? "opacity-0" : "opacity-100",
                  )}
                >
                  <span>Subscribe</span>
                </span>

                {submit.isPending && (
                  <Loader2 className="absolute size-4 animate-spin" />
                )}
              </Button>
            </form>
            {form.formState.errors.email && (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-1 justify-end gap-12">
          <div className="flex items-center gap-6">
            <Link
              href="/faq"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              FAQ
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AiToolHub.co
          </p>
        </div>
      </div>
    </footer>
  );
}
