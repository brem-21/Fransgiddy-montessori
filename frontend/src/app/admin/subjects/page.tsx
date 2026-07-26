"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExcelImportDialog } from "@/components/ExcelImportDialog";
import { subjectApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type { Subject } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Subject name is required"),
  classLevel: z.string().min(1, "Class level is required"),
});
type FormData = z.infer<typeof schema>;

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [filterClass, setFilterClass] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const load = async () => {
    setLoading(true);
    try {
      const res = await subjectApi.getAll();
      setSubjects(res.data.data);
    } catch {
      toast({ title: "Error", description: "Failed to load subjects.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    reset({ name: "", classLevel: "" });
    setDialogOpen(true);
  };

  const openEdit = (s: Subject) => {
    setEditing(s);
    reset({ name: s.name, classLevel: s.classLevel });
    setDialogOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      if (editing) {
        await subjectApi.update(editing.id, data);
        toast({ title: "Subject updated" });
      } else {
        await subjectApi.create(data);
        toast({ title: "Subject added" });
      }
      setDialogOpen(false);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Failed to save subject.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await subjectApi.delete(id);
      toast({ title: "Subject deleted" });
      setSubjects((prev) => prev.filter((s) => s.id !== id));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Failed to delete subject.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const classLevels = Array.from(new Set(subjects.map((s) => s.classLevel))).sort();
  const filtered = filterClass ? subjects.filter((s) => s.classLevel === filterClass) : subjects;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Subjects</h1>
          <p className="text-ash text-sm mt-1">
            Manage subjects available for result entry across all classes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExcelImportDialog
            entityLabel="Subjects"
            onImport={subjectApi.importExcel}
            onDownloadTemplate={subjectApi.downloadTemplate}
            templateFilename="subjects_template.xlsx"
            onComplete={load}
          />
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        </div>
      </div>

      {/* Filter */}
      {classLevels.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterClass("")}
            className={`px-3 py-1 rounded-full text-sm font-bold border transition-colors ${
              filterClass === ""
                ? "bg-clay text-white border-ink"
                : "text-ash border-pebble hover:border-ink"
            }`}
          >
            All
          </button>
          {classLevels.map((cl) => (
            <button
              key={cl}
              onClick={() => setFilterClass(cl)}
              className={`px-3 py-1 rounded-full text-sm font-bold border transition-colors ${
                filterClass === cl
                  ? "bg-clay text-white border-ink"
                  : "text-ash border-pebble hover:border-ink"
              }`}
            >
              {cl}
            </button>
          ))}
        </div>
      )}

      <Card className="  ">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-ash" />
            {filtered.length} subject{filtered.length !== 1 ? "s" : ""}
            {filterClass && ` in ${filterClass}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-pebble/20 animate-pulse rounded" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-ash">
              <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No subjects yet. Click <strong>Add Subject</strong> to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-white">
                  <TableHead className="font-bold text-ink">Subject Name</TableHead>
                  <TableHead className="font-bold text-ink">Class Level</TableHead>
                  <TableHead className="w-28" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-bold">{s.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{s.classLevel}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(s)}
                          className="h-8 w-8 p-0 text-ash hover:text-ink"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(s.id)}
                          disabled={deletingId === s.id}
                          className="h-8 w-8 p-0 text-ash hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Subject" : "Add Subject"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Subject Name *</Label>
              <Input
                placeholder="e.g. Mathematics"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Class Level *</Label>
              <Input
                placeholder="e.g. Class 1 or KG2"
                {...register("classLevel")}
              />
              {errors.classLevel && (
                <p className="text-xs text-red-600">{errors.classLevel.message}</p>
              )}
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editing ? "Update" : "Add Subject"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
