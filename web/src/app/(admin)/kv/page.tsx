"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({
  id: z.string().uuid().optional(),
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
});

export default function KeyValueStorePage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      key: "",
      value: "",
    },
  });

  const { data: keyValuePairs, refetch } = api.keyValue.getAll.useQuery();
  const createKeyValuePair = api.keyValue.create.useMutation({
    onSuccess: () => {
      refetch();
      form.reset();
    },
  });
  const updateKeyValuePair = api.keyValue.update.useMutation({
    onSuccess: () => {
      refetch();
      form.reset();
      setSelectedId(null);
    },
  });
  const deleteKeyValuePair = api.keyValue.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleCreateOrUpdate = (data: z.infer<typeof FormSchema>) => {
    if (selectedId) {
      updateKeyValuePair.mutate({
        id: selectedId,
        key: data.key,
        value: data.value,
      });
    } else {
      createKeyValuePair.mutate({ key: data.key, value: data.value });
    }
  };

  const handleEdit = (pair: { id: string; key: string; value: string }) => {
    setSelectedId(pair.id);
    form.setValue("id", pair.id);
    form.setValue("key", pair.key);
    form.setValue("value", pair.value);
  };

  const handleDelete = (id: string) => {
    deleteKeyValuePair.mutate({ id });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-4 text-2xl font-bold">Key Value</h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleCreateOrUpdate)}
          className="mb-4 flex space-x-2"
        >
          <FormField
            control={form.control}
            name="key"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormControl>
                  <Input type="text" placeholder="Key" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormControl>
                  <Input type="text" placeholder="Value" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">{selectedId ? "Update" : "Create"}</Button>
        </form>
      </Form>

      <ul>
        {keyValuePairs?.map((pair) => (
          <li
            key={pair.id}
            className="mb-2 flex items-center justify-between rounded border p-2 shadow-sm"
          >
            <div>
              <strong>{pair.key}:</strong> {pair.value}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(pair)}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(pair.id)}
              >
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
