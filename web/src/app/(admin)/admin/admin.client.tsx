"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

export type AdminClientPageProps = {};

function AdminClientPage({}: AdminClientPageProps) {
  const parseMutation = api.groomer.parse.useMutation({});
  const syncImagesMutation = api.groomer.syncImages.useMutation({});
  const deleteStuffMutation = api.groomer.deleteStuff.useMutation({});
  const createEmbeddingMutation = api.tools.createEmbeddings.useMutation({});
  const asdf = api.groomer.scrapeTaaftLinks.useMutation({});
  const slugifyMutation = api.tools.slugify.useMutation({});
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Button
        disabled={slugifyMutation.isPending}
        onClick={() => {
          slugifyMutation.mutate();
        }}
      >
        {slugifyMutation.isPending ? "Slugifying..." : "Slugify"}
      </Button>
    </div>
  );
}
export default AdminClientPage;
