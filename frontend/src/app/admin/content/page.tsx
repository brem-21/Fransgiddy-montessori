"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Globe, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { announcementApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type { Announcement } from "@/types";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  type: z.enum(["NEWS", "EVENT", "ANNOUNCEMENT"]),
  published: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function AdminContentPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "ANNOUNCEMENT", published: false },
  });

  const fetchAnnouncements = async () => {
    try {
      const res = await announcementApi.getAll();
      setAnnouncements(res.data.data);
    } catch {
      toast({ title: "Error", description: "Failed to load announcements.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await announcementApi.create(data);
      toast({ title: "Success", description: "Announcement created." });
      setDialogOpen(false);
      reset();
      fetchAnnouncements();
    } catch {
      toast({ title: "Error", description: "Failed to create announcement.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishToggle = async (announcement: Announcement) => {
    try {
      await announcementApi.publish(announcement.id);
      toast({
        title: "Updated",
        description: announcement.published ? "Announcement unpublished." : "Announcement published.",
      });
      fetchAnnouncements();
    } catch {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    setDeletingId(id);
    try {
      await announcementApi.delete(id);
      toast({ title: "Deleted", description: "Announcement removed." });
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage announcements, news and events.
          </p>
        </div>
        <Button onClick={() => { reset(); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> New Announcement
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : announcements.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No announcements yet. Create one to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs uppercase">
                      {a.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {a.published ? (
                      <Badge variant="default" className="text-xs">
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Draft
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {a.authorName}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(a.createdAt).toLocaleDateString("en-GB")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePublishToggle(a)}
                        title={a.published ? "Unpublish" : "Publish"}
                      >
                        {a.published ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Globe className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(a.id)}
                        disabled={deletingId === a.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Announcement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" placeholder="Announcement title" {...register("title")} />
              {errors.title && (
                <p className="text-xs text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="content">Content *</Label>
              <textarea
                id="content"
                rows={5}
                placeholder="Write your announcement here..."
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                {...register("content")}
              />
              {errors.content && (
                <p className="text-xs text-red-600">{errors.content.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Type *</Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
                        <SelectItem value="NEWS">News</SelectItem>
                        <SelectItem value="EVENT">Event</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Publish immediately?</Label>
                <div className="flex items-center gap-2 h-10">
                  <Controller
                    name="published"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        id="published"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    )}
                  />
                  <label htmlFor="published" className="text-sm text-gray-600">
                    Yes, publish now
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
