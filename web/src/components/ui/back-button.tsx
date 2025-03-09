import { ArrowLeft } from "lucide-react";

export type BackButtonProps = {
  link: string;
  label: string;
};

export function BackButton(props: BackButtonProps) {
  return (
    <a
      href={props.link}
      className="group flex cursor-pointer items-center gap-2 text-muted-foreground"
    >
      <ArrowLeft className="size-5" />
      <span className="underline-offset-4 group-hover:underline">
        {props.label}
      </span>
    </a>
  );
}
