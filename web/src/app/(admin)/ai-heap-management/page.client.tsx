"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, Edit, Loader2, MoreHorizontal, Trash2, X } from "lucide-react";
import { toast } from "sonner";

const categories = [
  "general",
  "consumer",
  "enterprise",
  "coding",
  "agent",
  "benchmarks",
] as const;

const FormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required"),
  category: z.enum(categories),
  parentId: z.string().uuid().optional(),
  url: z.string().url().optional(),
  image: z.string().url().optional(),
  metadata: z.string().optional(),
});

export default function AiHeapManagementClient() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      category: "general",
    },
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, string>>({});

  const { data, refetch } = api.aiHeap.getAll.useQuery();

  const createMutation = api.aiHeap.create.useMutation({
    onSuccess: () => {
      refetch();
      form.reset({ name: "", category: "general" });
      toast.success("Node created");
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = api.aiHeap.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditingId(null);
      toast.success("Node updated");
    },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = api.aiHeap.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Node deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  const handleCreate = (values: z.infer<typeof FormSchema>) => {
    createMutation.mutate({
      name: values.name,
      category: values.category,
      parentId: values.parentId,
      url: values.url,
      image: values.image,
      metadata: values.metadata ? JSON.parse(values.metadata) : undefined,
    });
  };

  const handleUpdate = (id: string) => {
    updateMutation.mutate({
      id,
      name: editData.name,
      category: (editData.category as (typeof categories)[number]) || undefined,
      parentId: editData.parentId || undefined,
      url: editData.url || undefined,
      image: editData.image || undefined,
      metadata: editData.metadata ? JSON.parse(editData.metadata) : undefined,
    });
  };

  const nodes = data?.nodes ?? [];
  const allNodes: { id: string; name: string }[] = [];
  const collect = (arr: any[]) => {
    for (const n of arr) {
      allNodes.push({ id: n.id, name: n.name });
      if (n.children?.length) collect(n.children);
    }
  };
  collect(nodes);

  return (
    <div className="container mx-auto space-y-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>AI Heap Nodes</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCreate)}
              className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-6"
            >
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="category"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="parentId"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Parent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {allNodes.map((n) => (
                          <SelectItem key={n.id} value={n.id}>
                            {n.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                name="url"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormControl>
                      <Input placeholder="URL" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="image"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormControl>
                      <Input placeholder="Image" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="metadata"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormControl>
                      <Textarea placeholder="Metadata JSON" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="md:col-span-1"
              >
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </form>
          </Form>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allNodes.map((node) => (
                <TableRow key={node.id}>
                  {editingId === node.id ? (
                    <>
                      <TableCell className="font-medium">
                        <Input
                          value={editData.name || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, name: e.target.value })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={editData.category || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              category: e.target.value,
                            })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={editData.parentId || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              parentId: e.target.value,
                            })
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              handleUpdate(node.id);
                            }}
                            disabled={updateMutation.isPending}
                          >
                            {updateMutation.isPending ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Check className="size-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingId(null);
                            }}
                            disabled={updateMutation.isPending}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="font-medium">{node.name}</TableCell>
                      <TableCell>{node.category}</TableCell>
                      <TableCell>{node.parentId ?? ""}</TableCell>
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
                              onClick={() => {
                                setEditingId(node.id);
                                setEditData({
                                  name: node.name,
                                  category: node.category,
                                  parentId: node.parentId,
                                });
                              }}
                            >
                              <Edit className="mr-2 size-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                deleteMutation.mutate({ id: node.id })
                              }
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="mr-2 size-4" /> Delete
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
        </CardContent>
      </Card>
    </div>
  );
}
