"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

export type AdminClientPageProps = {};

function AdminClientPage({}: AdminClientPageProps) {
  const backfill = api.emails.backfill.useMutation();
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Button
        disabled={backfill.isPending}
        onClick={() => {
          backfill.mutate();
        }}
      >
        {backfill.isPending ? "Backfilling..." : "Backfill Emails"}
      </Button>
    </div>
  );
}
export default AdminClientPage;
