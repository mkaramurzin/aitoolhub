"use client";

import { Textarea } from "@/components/ui/textarea";
import { ChangeEvent, useId, useRef } from "react";

type AutoGrowTextAreaProps = {
  onChange: (value: string) => void;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Component({
  onChange,
  ...props
}: AutoGrowTextAreaProps) {
  const id = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const defaultRows = 1;
  const maxRows = 10; // You can set a max number of rows

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = "auto";

    const style = window.getComputedStyle(textarea);
    const borderHeight =
      parseInt(style.borderTopWidth) + parseInt(style.borderBottomWidth);
    const paddingHeight =
      parseInt(style.paddingTop) + parseInt(style.paddingBottom);

    const lineHeight = parseInt(style.lineHeight);
    const maxHeight = maxRows
      ? lineHeight * maxRows + borderHeight + paddingHeight
      : Infinity;

    const newHeight = Math.min(textarea.scrollHeight + borderHeight, maxHeight);

    textarea.style.height = `${newHeight}px`;
  };

  return (
    <Textarea
      id={id}
      placeholder="What’re we buying today?"
      ref={textareaRef}
      onChange={(e) => {
        handleInput(e);
        onChange(e.target.value);
      }}
      rows={defaultRows}
      className="min-h-[none] resize-none border-0 shadow-none focus:border-0 focus-visible:ring-0"
      {...props}
    />
  );
}
