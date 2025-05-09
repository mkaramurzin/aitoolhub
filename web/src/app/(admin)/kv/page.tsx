"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Edit, Loader2, MoreHorizontal, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const FormSchema = z.object({
  id: z.string().uuid().optional(),
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
});

export default function KeyValueStorePage() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editKey, setEditKey] = useState("");
  const [editValue, setEditValue] = useState("");

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      key: "",
      value: "",
    },
  });

  const {
    data: keyValuePairs,
    refetch,
    isLoading: isLoadingPairs,
  } = api.keyValue.getAll.useQuery();
  const createKeyValuePair = api.keyValue.create.useMutation({
    onSuccess: () => {
      refetch();
      form.reset();
      toast.success("Key-value pair created.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const updateKeyValuePair = api.keyValue.update.useMutation({
    onSuccess: () => {
      refetch();
      form.reset();
      toast.success("Key-value pair updated.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const deleteKeyValuePair = api.keyValue.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Key-value pair deleted.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreate = (data: z.infer<typeof FormSchema>) => {
    createKeyValuePair.mutate({ key: data.key, value: data.value });
  };

  const handleUpdate = (id: string) => {
    updateKeyValuePair.mutate({
      id,
      key: editKey,
      value: editValue,
    });
    setEditingId(null);
    setEditKey("");
    setEditValue("");
  };

  const handleEditClick = (pair: {
    id: string;
    key: string;
    value: string;
  }) => {
    setEditingId(pair.id);
    setEditKey(pair.key);
    setEditValue(pair.value);
  };

  const handleCancelClick = () => {
    setEditingId(null);
    setEditKey("");
    setEditValue("");
  };

  const handleDelete = (id: string) => {
    deleteKeyValuePair.mutate({ id });
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Key Value Store</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCreate)}
              className="mb-4 flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0"
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
              <Button type="submit" disabled={createKeyValuePair.isPending}>
                {createKeyValuePair.isPending ? "Creating..." : "Create"}
              </Button>
            </form>
          </Form>

          {isLoadingPairs ? (
            <div>Loading key-value pairs...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keyValuePairs?.map((pair) => (
                  <TableRow key={pair.id}>
                    {editingId === pair.id ? (
                      <>
                        <TableCell className="font-medium">
                          <Input
                            value={editKey}
                            onChange={(e) => setEditKey(e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Textarea
                            className="field-sizing-content"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUpdate(pair.id)}
                              disabled={updateKeyValuePair.isPending}
                            >
                              {updateKeyValuePair.isPending ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Check className="size-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleCancelClick}
                              disabled={updateKeyValuePair.isPending}
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="font-medium">
                          {pair.key}
                        </TableCell>
                        <TableCell>{pair.value}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditClick(pair)}
                              >
                                <Edit className="mr-2 size-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(pair.id)}
                                disabled={deleteKeyValuePair.isPending}
                              >
                                <Trash2 className="mr-2 size-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
