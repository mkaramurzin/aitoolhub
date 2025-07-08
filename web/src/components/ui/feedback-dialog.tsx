"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageSquare, Star, Loader2, Check } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";

const feedbackCategories = [
  { value: "general", label: "General Feedback" },
  { value: "bug-report", label: "Bug Report" },
  { value: "feature-request", label: "Feature Request" },
  { value: "ui-ux", label: "UI/UX Feedback" },
  { value: "performance", label: "Performance Issue" },
  { value: "content", label: "Content Feedback" },
  { value: "other", label: "Other" },
] as const;

const FeedbackSchema = z.object({
  message: z.string().min(1, "Message is required").max(1000, "Message too long"),
  rating: z.number().int().min(1).max(5).optional(),
  category: z.enum(["general", "bug-report", "feature-request", "ui-ux", "performance", "content", "other"]).optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
});

type FeedbackForm = z.infer<typeof FeedbackSchema>;

interface FeedbackDialogProps {
  children?: React.ReactNode;
  className?: string;
}

export function FeedbackDialog({ children, className }: FeedbackDialogProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  const submit = api.feedback.submit.useMutation({
    onSuccess: () => {
      setTimeout(() => {
        setOpen(false);
        form.reset();
        setRating(0);
        setHoveredRating(0);
        submit.reset();
      }, 2000);
    },
  });

  const form = useForm<FeedbackForm>({
    resolver: zodResolver(FeedbackSchema),
    defaultValues: {
      message: "",
      email: "",
      category: "general",
    },
  });

  function onSubmit(data: FeedbackForm) {
    submit.mutate({
      message: data.message,
      rating: rating > 0 ? rating : undefined,
      category: data.category,
      email: data.email || undefined,
    });
  }

  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  if (submit.data?.success) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children || (
            <Button variant="outline" size="sm" className={className}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Feedback
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="rounded-full bg-green-100 p-2 mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Thank You!</h3>
            <p className="text-muted-foreground">
              Your feedback has been submitted successfully. We appreciate you taking the time to help us improve!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className={className}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Feedback
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Your Feedback</DialogTitle>
          <DialogDescription>
            Help us improve by sharing your thoughts, reporting bugs, or suggesting new features.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Rating */}
            <div className="space-y-2">
              <label className="text-sm font-medium">How would you rate your experience? (Optional)</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1 rounded hover:bg-muted transition-colors"
                    onClick={() => handleRatingClick(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    <Star
                      className={cn(
                        "h-5 w-5",
                        (hoveredRating >= star || rating >= star)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {feedbackCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Message */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Message *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us what you think, report a bug, or suggest a feature..."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between">
                    <FormMessage />
                    <span className="text-xs text-muted-foreground">
                      {field.value?.length || 0}/1000
                    </span>
                  </div>
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Email (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    We'll only use this to follow up on your feedback if needed.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
                disabled={submit.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={submit.isPending}
              >
                {submit.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 