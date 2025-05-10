"use client";

"use client";

import { StarRating } from "@/app/_components/star-rating"; // Import StarRating component
import { Button } from "@/components/ui/button";
import {
  Form, // Added Form import
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Send, Sparkles } from "lucide-react"; // Added Sparkles and Send icons
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
  feedback: z.string().optional(), // Feedback field is already here
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
      feedback: "", // Added default value for feedback
      rating, // Set a default value for rating
    },
  });

  const [submitted, setSubmitted] = useState(false); // Renamed success to submitted

  // 3. Define your tRPC mutation
  const emailReviewMutation = api.emailReview.upsert.useMutation({
    onSuccess: () => {
      setSubmitted(true); // Updated to setSubmitted
      form.reset();
    },
    onError: (error: any) => {
      // Handle errors - could display an error message in the UI
      console.error("Feedback submission error:", error);
    },
  });

  function handleSubmit(values: z.infer<typeof formSchema>) {
    // Renamed onSubmit to handleSubmit
    emailReviewMutation.mutate(values);
  }

  return (
    <div className="flex h-dvh w-dvw flex-col items-center justify-center p-6">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-[#1a1d24] shadow-xl">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 blur-xl"></div>
          <div className="relative flex items-center space-x-3 p-6">
            <div className="rounded-lg bg-indigo-500/20 p-2">
              <Mail className="h-6 w-6 text-indigo-400" />{" "}
              {/* Used Mail icon */}
            </div>
            <h2 className="text-2xl font-bold text-white">Provide Feedback</h2>
          </div>
        </div>
        {/* Form Content */}
        <div className="p-6">
          <p className="mb-6 text-gray-400">
            Help us improve by providing your feedback on this article. Your
            insights are valuable to us.
          </p>
          {submitted ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="rounded-full bg-indigo-500/20 p-3">
                <Sparkles className="h-8 w-8 text-indigo-400" />
              </div>
              <p className="text-lg font-medium text-white">
                Thank you for your feedback!
              </p>
              <p className="text-center text-gray-400">
                Your input helps us improve our content.
              </p>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1 block text-sm font-medium text-gray-300"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="email"
                              id="email"
                              placeholder="Your email address"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="feedback"
                    className="mb-1 block text-sm font-medium text-gray-300"
                  >
                    Feedback
                  </label>
                  <FormField
                    control={form.control}
                    name="feedback"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            id="feedback"
                            rows={3}
                            className="content"
                            placeholder="Share your thoughts about this article"
                            {...field}
                          ></Textarea>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Rating
                  </label>
                  <StarRating
                    rating={form.watch("rating")}
                    onRatingChange={(value) => form.setValue("rating", value)}
                  />{" "}
                  {/* Using form.watch and form.setValue */}
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  type="submit"
                  disabled={emailReviewMutation.isPending}
                >
                  <span>Submit Feedback</span>
                  {emailReviewMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
