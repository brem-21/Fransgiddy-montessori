"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, UserX } from "lucide-react";
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
import { studentApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type { Student } from "@/types";

const studentSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  className: z.string().min(1, "Class required"),
  dateOfBirth: z.string().min(1, "Date of birth required"),
  parentName: z.string().min(1, "Parent name required"),
  parentPhone: z.string().min(7, "Parent phone required"),
  enrollmentDate: z.string().min(1, "Enrollment date required"),
});

type StudentFormData = z.infer<typeof studentSchema>;

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentFormData>({ resolver: zodResolver(studentSchema) });

  const fetchStudents = async () => {
    try {
      const res = await studentApi.getAll();
      setStudents(res.data.data);
    } catch {
      toast({ title: "Error", description: "Failed to load students.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const openAddDialog = () => {
    setEditingStudent(null);
    reset({
      firstName: "",
      lastName: "",
      className: "",
      dateOfBirth: "",
      parentName: "",
      parentPhone: "",
      enrollmentDate: "",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (student: Student) => {
    setEditingStudent(student);
    reset({
      firstName: student.firstName,
      lastName: student.lastName,
      className: student.className,
      dateOfBirth: student.dateOfBirth,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      enrollmentDate: student.enrollmentDate,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: StudentFormData) => {
    setSubmitting(true);
    try {
      if (editingStudent) {
        await studentApi.update(editingStudent.id, data);
        toast({ title: "Updated", description: "Student record updated." });
      } else {
        await studentApi.create(data);
        toast({ title: "Created", description: "Student added successfully." });
      }
      setDialogOpen(false);
      fetchStudents();
    } catch {
      toast({ title: "Error", description: "Failed to save student.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (student: Student) => {
    if (!confirm(`Deactivate ${student.firstName} ${student.lastName}?`)) return;
    try {
      await studentApi.deactivate(student.id);
      toast({ title: "Deactivated", description: "Student has been deactivated." });
      fetchStudents();
    } catch {
      toast({ title: "Error", description: "Failed to deactivate student.", variant: "destructive" });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage enrolled students.
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-1" /> Add Student
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No students enrolled yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Parent Phone</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    {student.firstName} {student.lastName}
                  </TableCell>
                  <TableCell className="text-sm">{student.className}</TableCell>
                  <TableCell className="text-sm">{student.parentName}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {student.parentPhone}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(student.enrollmentDate).toLocaleDateString("en-GB")}
                  </TableCell>
                  <TableCell>
                    {student.active ? (
                      <Badge variant="success" className="text-xs">Active</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(student)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {student.active && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-amber-500 hover:text-amber-700"
                          onClick={() => handleDeactivate(student)}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStudent ? "Edit Student" : "Add New Student"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" {...register("firstName")} />
                {errors.firstName && (
                  <p className="text-xs text-red-600">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" {...register("lastName")} />
                {errors.lastName && (
                  <p className="text-xs text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="className">Class *</Label>
                <Input id="className" placeholder="e.g. Primary 3" {...register("className")} />
                {errors.className && (
                  <p className="text-xs text-red-600">{errors.className.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
                {errors.dateOfBirth && (
                  <p className="text-xs text-red-600">{errors.dateOfBirth.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="parentName">Parent / Guardian Name *</Label>
              <Input id="parentName" {...register("parentName")} />
              {errors.parentName && (
                <p className="text-xs text-red-600">{errors.parentName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="parentPhone">Parent Phone *</Label>
              <Input id="parentPhone" type="tel" {...register("parentPhone")} />
              {errors.parentPhone && (
                <p className="text-xs text-red-600">{errors.parentPhone.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="enrollmentDate">Enrollment Date *</Label>
              <Input id="enrollmentDate" type="date" {...register("enrollmentDate")} />
              {errors.enrollmentDate && (
                <p className="text-xs text-red-600">{errors.enrollmentDate.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : editingStudent ? "Update" : "Add Student"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
