"use client";
import { SubscribeEmailCapture } from "@/app/_components/subscribe-email-capture";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { useUpSellStore } from "@/store/useUpSellStore";
import { api } from "@/trpc/react";
import { useEffect, useState } from "react";

export type TimedEmailPopupProps = {};

export function TimedEmailPopup(props: TimedEmailPopupProps) {
  const [open, setOpen] = useState(false);
  const { data: userData } = authClient.useSession();
  const { hasShownEmailModal, setHasShownEmailModal } = useUpSellStore();

  const checkMutation = api.waitlist.check.useMutation({
    onSuccess: (data) => {
      if (data.subscribed) return;
      setOpen(true);
      setHasShownEmailModal(true);
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (hasShownEmailModal) return;
      if (userData) {
        checkMutation.mutate({
          email: userData.user.email,
        });
      } else {
        setOpen(true);
        setHasShownEmailModal(true);
      }
    }, 30 * 1000);

    return () => clearTimeout(timer);
  }, [userData, hasShownEmailModal]);

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
        <DialogTitle className="hidden"></DialogTitle>
        <SubscribeEmailCapture />
      </DialogContent>
    </Dialog>
  );
}
