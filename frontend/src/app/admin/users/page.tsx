"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { userApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type { User } from "@/types";

const createSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(7, "Valid phone number required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type CreateFormData = z.infer<typeof createSchema>;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFormData>({ resolver: zodResolver(createSchema) });

  const fetchUsers = async () => {
    try {
      const res = await userApi.getAll();
      setUsers(res.data.data);
    } catch {
      toast({ title: "Error", description: "Failed to load users.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onCreate = async (data: CreateFormData) => {
    setSubmitting(true);
    try {
      await userApi.createTeacher(data);
      toast({ title: "Teacher Created", description: `${data.name} can now log in with their phone number.` });
      setDialogOpen(false);
      reset();
      fetchUsers();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to create teacher.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (user: User) => {
    setTogglingId(user.id);
    try {
      await userApi.toggleActive(user.id);
      toast({
        title: "Updated",
        description: `${user.name} has been ${user.active ? "deactivated" : "activated"}.`,
      });
      fetchUsers();
    } catch {
      toast({ title: "Error", description: "Failed to update user status.", variant: "destructive" });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.name}?`)) return;
    setDeletingId(user.id);
    try {
      await userApi.delete(user.id);
      toast({ title: "Deleted", description: `${user.name} has been removed.` });
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch {
      toast({ title: "Error", description: "Failed to delete user.", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage teachers and administrators.
          </p>
        </div>
        <Button onClick={() => { reset(); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Teacher
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No users found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-gray-500 text-sm">{user.phone}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "PRINCIPAL" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {user.role === "PRINCIPAL" ? "Principal" : "Teacher"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.active ? (
                      <Badge variant="success" className="text-xs">Active</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-GB") : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggle(user)}
                        disabled={togglingId === user.id || user.role === "PRINCIPAL"}
                        title={user.active ? "Deactivate" : "Activate"}
                      >
                        {user.active ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(user)}
                        disabled={deletingId === user.id || user.role === "PRINCIPAL"}
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

      {/* Create Teacher Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Teacher</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" placeholder="Teacher's full name" {...register("name")} />
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g. 0241234567"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-xs text-red-600">{errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Initial Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 6 characters"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>
            <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
              Share the phone number and password with the teacher. They can change their password after logging in.
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
                {submitting ? "Creating..." : "Create Teacher"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
