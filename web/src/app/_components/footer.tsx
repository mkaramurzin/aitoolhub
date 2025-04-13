import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="mt-auto w-full border-t bg-background/50 py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 md:flex-row">
        <div className="flex items-center gap-6">
          <Link
            href="/submissions"
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Submit Tool
          </Link>
        </div>
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="email"
            placeholder="Enter your email"
            className="flex-1"
          />
          <Button type="submit">Subscribe</Button>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} AiToolHub.co
        </p>
      </div>
    </footer>
  );
} 