import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | AiToolHub",
  description: "Answers to common questions about purchasing, pricing and using AI tools on AiToolHub.",
};

export default function FaqPage() {
  return (
    <div className="flex w-full justify-center">
      <div className="flex w-full max-w-5xl flex-col p-4 sm:pt-10">
        <h1 className="mb-4 text-3xl font-bold">Frequently Asked Questions</h1>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="purchase">
            <AccordionTrigger>How do I purchase an AI tool?</AccordionTrigger>
            <AccordionContent>
              You can buy tools directly from each listing. Click the purchase button and follow the checkout instructions.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="pricing">
            <AccordionTrigger>Are there any free trials or discounts?</AccordionTrigger>
            <AccordionContent>
              Some tools offer free trials or introductory pricing. Check the pricing section of each tool for current deals.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="usage">
            <AccordionTrigger>Can I use these tools for commercial projects?</AccordionTrigger>
            <AccordionContent>
              Yes, unless stated otherwise by the developer. Review the tool&apos;s license details to confirm commercial usage rights.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}