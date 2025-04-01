"use client";
import { SubscribeEmailCapture } from "@/app/_components/subscribe-email-capture";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { api } from "@/trpc/react";
import { useEffect, useState } from "react";

export type TimedEmailPopupProps = {};

export function TimedEmailPopup(props: TimedEmailPopupProps) {
  const [open, setOpen] = useState(false);
  const { data: userData } = authClient.useSession();

  const checkMutation = api.waitlist.check.useMutation({
    onSuccess: (data) => {
      if (data.subscribed) return;
      setOpen(true);
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (userData) {
        // If user is logged in, check their subscription status.
        checkMutation.mutate({
          email: userData.user.email,
        });
      } else {
        // If not logged in, open the dialog directly.
        setOpen(true);
      }
    }, 60 * 1000);

    return () => clearTimeout(timer);
  }, [userData]);

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <div className="fixed bottom-0 left-0 m-6 h-0 w-0"></div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <SubscribeEmailCapture />
      </DialogContent>
    </Dialog>
  );
}
