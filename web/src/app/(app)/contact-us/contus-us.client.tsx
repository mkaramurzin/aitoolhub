"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Define the schema for the contact form.
const ContactUsSchema = z.object({
  firstName: z.string().nonempty("First name is required"),
  lastName: z.string().nonempty("Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().nonempty("Phone number is required"),
  companyName: z.string().nonempty("Company name is required"),
  // We use a string validation with a refine to enforce one of the specified options.
  reasonForContact: z
    .string()
    .nonempty("Please select a reason for contact")
    .refine(
      (val) =>
        [
          "custom-campaign",
          "sales",
          "support",
          "feedback",
          "events",
          "partnerships",
          "press",
          "other",
        ].includes(val),
      { message: "Please select a valid reason" },
    ),
  message: z.string().nonempty("Message is required"),
});

export function ContactUsForm() {
  const submit = api.contactUs.submit.useMutation({
    onSuccess: () => {},
  });
  const form = useForm<z.infer<typeof ContactUsSchema>>({
    resolver: zodResolver(ContactUsSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      companyName: "",
      message: "",
    },
  });

  function onSubmit(data: z.infer<typeof ContactUsSchema>) {
    submit.mutate(data);
  }

  return (
    <>
      {submit.data ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-6 px-6 text-center">
          <span className="text-2xl font-semibold">Thank You!</span>

          <span className="text-muted-foreground">
            Thank you for your submission. We will get back to you shortly.
          </span>

          <Button
            onClick={() => {
              submit.reset();
              form.reset();
            }}
          >
            Submit again
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="flex w-full max-w-3xl flex-col justify-center space-y-6 p-4">
            <div className="flex w-full flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-2xl font-semibold">Contact Us</span>

                <span className="text-muted-foreground">
                  {`Please fill out the form below and we'll get back to you
                  shortly.`}
                </span>
              </div>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Personal Information Section */}
                <div className="flex flex-col space-y-4 rounded-md bg-primary/5 p-4">
                  <h3 className="text-xl">Personal Information</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="First Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="Last Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address*</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number*</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone Number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="Company Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Reason for Contact Section */}
                <div className="flex flex-col space-y-4 rounded-md bg-primary/5 p-4">
                  <h3 className="text-xl">Reason for Contact</h3>
                  <FormField
                    control={form.control}
                    name="reasonForContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for Contact*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a reason for contact" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="custom-campaign">
                              Custom campaign
                            </SelectItem>
                            <SelectItem value="sales">Sales</SelectItem>
                            <SelectItem value="support">Support</SelectItem>
                            <SelectItem value="feedback">Feedback</SelectItem>
                            <SelectItem value="events">Events</SelectItem>
                            <SelectItem value="partnerships">
                              Partnerships
                            </SelectItem>
                            <SelectItem value="press">Press</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message*</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Your message" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex w-full justify-end">
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
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}
    </>
  );
}
