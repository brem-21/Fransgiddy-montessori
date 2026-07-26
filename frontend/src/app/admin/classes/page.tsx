"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, UserPlus, Users } from "lucide-react";
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
import { ExcelImportDialog } from "@/components/ExcelImportDialog";
import { classApi, userApi, studentApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type { SchoolClass, User, Student } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Class name is required"),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [assignTeachersOpen, setAssignTeachersOpen] = useState(false);
  const [assignStudentsOpen, setAssignStudentsOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<number[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const loadData = async () => {
    try {
      const [classRes, teacherRes, studentRes] = await Promise.allSettled([
        classApi.getAll(),
        userApi.getAll(),
        studentApi.getAll(),
      ]);
      if (classRes.status === "fulfilled") setClasses(classRes.value.data.data);
      if (teacherRes.status === "fulfilled")
        setTeachers(teacherRes.value.data.data.filter((u) => u.role === "TEACHER"));
      if (studentRes.status === "fulfilled")
        setStudents(studentRes.value.data.data.filter((s) => s.active));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await classApi.create(data);
      toast({ title: "Success", description: "Class created." });
      setCreateOpen(false);
      reset();
      loadData();
    } catch {
      toast({ title: "Error", description: "Failed to create class.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this class?")) return;
    try {
      await classApi.delete(id);
      toast({ title: "Deleted", description: "Class removed." });
      setClasses((prev) => prev.filter((c) => c.id !== id));
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const openAssignTeachers = (sc: SchoolClass) => {
    setSelectedClass(sc);
    setSelectedTeacherIds(sc.teacherIds);
    setAssignTeachersOpen(true);
  };

  const openAssignStudents = (sc: SchoolClass) => {
    setSelectedClass(sc);
    const classStudents = students.filter((s) => s.className === sc.name).map((s) => s.id);
    setSelectedStudentIds(classStudents);
    setAssignStudentsOpen(true);
  };

  const handleAssignTeachers = async () => {
    if (!selectedClass) return;
    try {
      await classApi.assignTeachers(selectedClass.id, selectedTeacherIds);
      toast({ title: "Updated", description: "Teachers assigned." });
      setAssignTeachersOpen(false);
      loadData();
    } catch {
      toast({ title: "Error", description: "Failed to assign teachers.", variant: "destructive" });
    }
  };

  const handleAssignStudents = async () => {
    if (!selectedClass) return;
    try {
      await classApi.assignStudents(selectedClass.id, selectedStudentIds);
      toast({ title: "Updated", description: "Students assigned to class." });
      setAssignStudentsOpen(false);
      loadData();
    } catch {
      toast({ title: "Error", description: "Failed to assign students.", variant: "destructive" });
    }
  };

  const toggleId = (id: number, list: number[], setList: React.Dispatch<React.SetStateAction<number[]>>) => {
    setList((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Class Management</h1>
          <p className="text-ash text-sm mt-1">
            Create classes and assign students and teachers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExcelImportDialog
            entityLabel="Classes"
            onImport={classApi.importExcel}
            onDownloadTemplate={classApi.downloadTemplate}
            templateFilename="classes_template.xlsx"
            onComplete={loadData}
          />
          <Button onClick={() => { reset(); setCreateOpen(true); }} className="bg-clay hover:bg-ink/80">
            <Plus className="h-4 w-4 mr-1" /> New Class
          </Button>
        </div>
      </div>

      <Card className="  ">
        {loading ? (
          <div className="p-8 text-center text-ash">Loading...</div>
        ) : classes.length === 0 ? (
          <div className="p-12 text-center text-ash">No classes yet. Create one to get started.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Teachers</TableHead>
                <TableHead>Students</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-bold text-ink">{c.name}</TableCell>
                  <TableCell className="text-ash text-sm">{c.description || "—"}</TableCell>
                  <TableCell>
                    {c.teacherNames.length === 0 ? (
                      <span className="text-ash text-sm">None</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {c.teacherNames.map((name) => (
                          <Badge key={name} variant="secondary" className="text-xs">{name}</Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{c.studentCount} students</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openAssignTeachers(c)} title="Assign Teachers">
                        <UserPlus className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openAssignStudents(c)} title="Assign Students">
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(c.id)}
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

      {/* Create Class Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Class</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Class Name *</Label>
              <Input id="name" placeholder="e.g. Grade 1" {...register("name")} />
              {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Optional description" {...register("description")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-clay hover:bg-ink/80">
                {submitting ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Teachers Dialog */}
      <Dialog open={assignTeachersOpen} onOpenChange={setAssignTeachersOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Teachers to {selectedClass?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {teachers.map((t) => (
              <label key={t.id} className="flex items-center gap-3 p-2 rounded-none hover:bg-pebble/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTeacherIds.includes(t.id)}
                  onChange={() => toggleId(t.id, selectedTeacherIds, setSelectedTeacherIds)}
                  className="h-4 w-4 rounded border-pebble text-clay"
                />
                <span className="text-sm font-bold">{t.name}</span>
                <span className="text-xs text-ash">{t.phone}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignTeachersOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignTeachers} className="bg-clay hover:bg-ink/80">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Students Dialog */}
      <Dialog open={assignStudentsOpen} onOpenChange={setAssignStudentsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Students to {selectedClass?.name}</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-ash -mt-2">Assigning a student moves them to this class.</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {students.map((s) => (
              <label key={s.id} className="flex items-center gap-3 p-2 rounded-none hover:bg-pebble/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedStudentIds.includes(s.id)}
                  onChange={() => toggleId(s.id, selectedStudentIds, setSelectedStudentIds)}
                  className="h-4 w-4 rounded border-pebble text-clay"
                />
                <span className="text-sm font-bold">{s.firstName} {s.lastName}</span>
                <Badge variant="secondary" className="text-xs">{s.className}</Badge>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignStudentsOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignStudents} className="bg-clay hover:bg-ink/80">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
