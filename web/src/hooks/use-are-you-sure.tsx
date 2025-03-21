import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

export type useAreYouSureProps = {};

export type AreYouSureProps = {
  title?: string;
  description?: string;
  isPending?: boolean;
  onConfirm?: () => Promise<void>;
  onCancel?: () => Promise<void>;
};

export function useAreYouSure({}: useAreYouSureProps) {
  const [showAreYouSure, setShowAreYouSure] = useState(false);

  function AreYouSure({
    title = "Are you sure?",
    description = "This action cannot be undone.",
    onConfirm,
    onCancel,
  }: AreYouSureProps) {
    return (
      <AlertDialog open={showAreYouSure} onOpenChange={setShowAreYouSure}>
        <AlertDialogTrigger asChild>
          <div className="hidden"></div>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {onCancel && (
              <AlertDialogCancel
                onClick={async () => {
                  onCancel();
                  setShowAreYouSure(false);
                }}
              >
                Cancel
              </AlertDialogCancel>
            )}
            {onConfirm && (
              <AlertDialogAction
                className={cn(buttonVariants({ variant: "destructive" }))}
                onClick={async () => {
                  onConfirm();
                  setShowAreYouSure(false);
                }}
              >
                Continue
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return {
    AreYouSure,
    setShowAreYouSure,
    showAreYouSure,
  };
}
