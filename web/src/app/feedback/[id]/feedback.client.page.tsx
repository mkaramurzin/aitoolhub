"use client";

"use client";

import { StarRating } from "@/app/_components/star-rating"; // Import StarRating component
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
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// 1. Define your form schema using Zod
const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  techCrunchId: z.string().min(1, {
    message: "TechCrunch ID is required.",
  }),
  rating: z
    .number()
    .int()
    .min(1, { message: "Please provide a rating." })
    .max(5), // Added rating field with validation
});

export default function FeedbackPage({
  techCrunchId,
  rating = 0,
  email,
}: {
  techCrunchId: string;
  rating?: number;
  email?: string;
}) {
  // 2. Initialize useForm with your schema and resolver
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: email ?? "",
      techCrunchId,
      rating, // Set a default value for rating
    },
  });

  const [success, setSuccess] = useState(false);

  // 3. Define your tRPC mutation
  const emailReviewMutation = api.emailReview.upsert.useMutation({
    onSuccess: () => {
      setSuccess(true);
      form.reset();
    },
    onError: (error: any) => {
      // Handle errors - could display an error message in the UI
      console.error("Feedback submission error:", error);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    emailReviewMutation.mutate(values);
  }

  return (
    <div className="flex h-dvh w-dvw flex-col items-center justify-center p-6">
      <div className="flex w-full max-w-lg flex-col justify-center space-y-3">
        <div className="flex items-center text-3xl">
          <Mail className="mr-4 size-6 text-primary" strokeWidth={3} />
          <span className="text-xl text-white">Provide Feedback</span>
        </div>
        <span className="text-muted-foreground">
          Help us improve by providing your feedback on this TechCrunch article.
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Add StarRating FormField */}
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col">
                      <FormLabel>Rating</FormLabel>
                      <FormControl>
                        <StarRating
                          rating={field.value}
                          onRatingChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  disabled={emailReviewMutation.isPending}
                  type="submit"
                  className="relative flex w-full items-center justify-center"
                >
                  <span
                    className={cn(
                      "flex items-center gap-2",
                      emailReviewMutation.isPending
                        ? "opacity-0"
                        : "opacity-100",
                    )}
                  >
                    <span>Submit Feedback</span>
                  </span>
                  {emailReviewMutation.isPending && (
                    <Loader2 className="absolute size-4 animate-spin" />
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <span className="text-green-500">Thank you for your feedback!</span>
          )}
        </div>
      </div>
    </div>
  );
}
