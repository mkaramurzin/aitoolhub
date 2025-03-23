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
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Button
        disabled={syncImagesMutation.isPending}
        onClick={() => {
          syncImagesMutation.mutate();
        }}
      >
        {syncImagesMutation.isPending ? "Syncing..." : "Sync Images"}
      </Button>

      <Button
        disabled={deleteStuffMutation.isPending}
        onClick={() => {
          deleteStuffMutation.mutate();
        }}
      >
        {deleteStuffMutation.isPending ? "Deleting..." : "Delete Stuff"}
      </Button>

      <Button
        disabled={parseMutation.isPending}
        onClick={() => {
          parseMutation.mutate({});
        }}
      >
        {parseMutation.isPending ? "Grooming..." : "Groom"}
      </Button>

      <Button
        disabled={createEmbeddingMutation.isPending}
        onClick={() => {
          createEmbeddingMutation.mutate({
            text: "Hello world",
          });
        }}
      >
        {createEmbeddingMutation.isPending ? "Creating..." : "Create Embedding"}
      </Button>

      <Button
        disabled={asdf.isPending}
        onClick={() => {
          asdf.mutate();
        }}
      >
        {asdf.isPending ? "Removing..." : "Removing Taaft Links"}
      </Button>
    </div>
  );
}
export default AdminClientPage;
