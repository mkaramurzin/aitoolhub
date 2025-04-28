"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

export type AdminClientPageProps = {};

function AdminClientPage({}: AdminClientPageProps) {
  const sendEmailMutation = api.emails.send.useMutation();
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Button
        disabled={sendEmailMutation.isPending}
        onClick={() => {
          sendEmailMutation.mutate({
            email: "dylancronkhite1@gmail.com",
          });
        }}
      >
        {sendEmailMutation.isPending ? "Sending..." : "Send Email"}
      </Button>
    </div>
  );
}
export default AdminClientPage;
