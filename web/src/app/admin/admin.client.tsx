"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

export type AdminClientPageProps = {};

function AdminClientPage({}: AdminClientPageProps) {
  const createTagsMutation = api.tools.gentoolsandtags.useMutation({});

  const groomerMutation = api.groomer.parse.useMutation({});
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Button
        onClick={() => {
          createTagsMutation.mutate({});
        }}
      >
        Create Tools
      </Button>

      <Button
        disabled={groomerMutation.isPending}
        onClick={() => {
          groomerMutation.mutate({});
        }}
      >
        {groomerMutation.isPending ? "Grooming..." : "Groom"}
      </Button>
    </div>
  );
}
export default AdminClientPage;
