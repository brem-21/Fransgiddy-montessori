"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { subjectApi, resultApi } from "@/lib/api";
import { useMyStudents } from "@/hooks/use-my-students";
import { toast } from "@/hooks/use-toast";
import type { Subject, Result } from "@/types";

const schema = z.object({
  studentId: z.string().min(1, "Select a student"),
  subjectId: z.string().min(1, "Select a subject"),
  term: z.enum(["FIRST", "SECOND", "THIRD"]),
  academicYear: z
    .string()
    .min(1, "Academic year required")
    .regex(/^\d{4}\/\d{4}$/, "Format: YYYY/YYYY e.g. 2024/2025"),
  score: z
    .number({ invalid_type_error: "Score must be a number" })
    .min(0, "Min 0")
    .max(100, "Max 100"),
  remarks: z.string().optional().default(""),
});

type FormData = z.infer<typeof schema>;

export default function TeacherResultsPage() {
  const { students } = useMyStudents();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [myResults, setMyResults] = useState<Result[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { term: "FIRST", academicYear: "2024/2025" },
  });

  const fetchData = async () => {
    const [subjectsRes, resultsRes] = await Promise.allSettled([
      subjectApi.getAll(),
      resultApi.myEntries(),
    ]);
    if (subjectsRes.status === "fulfilled")
      setSubjects(subjectsRes.value.data.data);
    if (resultsRes.status === "fulfilled")
      setMyResults(resultsRes.value.data.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await resultApi.enter({
        studentId: Number(data.studentId),
        subjectId: Number(data.subjectId),
        term: data.term,
        academicYear: data.academicYear,
        score: data.score,
        remarks: data.remarks,
      });
      toast({ title: "Result Saved", description: "Result entered successfully." });
      reset({ term: "FIRST", academicYear: "2024/2025", score: undefined as unknown as number, remarks: "" });
      fetchData();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to save result.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Enter Results</h1>
        <p className="text-ash text-sm mt-1">
          Record student assessment results.
        </p>
      </div>

      {/* Entry Form */}
      <Card className="  ">
        <CardHeader>
          <CardTitle className="text-base">New Result Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Student Select */}
              <div className="space-y-1.5">
                <Label>Student *</Label>
                <Controller
                  name="studentId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select student..." />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.firstName} {s.lastName} — {s.className}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.studentId && (
                  <p className="text-xs text-red-600">{errors.studentId.message}</p>
                )}
              </div>

              {/* Subject Select */}
              <div className="space-y-1.5">
                <Label>Subject *</Label>
                <Controller
                  name="subjectId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject..." />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.name} ({s.classLevel})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.subjectId && (
                  <p className="text-xs text-red-600">{errors.subjectId.message}</p>
                )}
              </div>

              {/* Term */}
              <div className="space-y-1.5">
                <Label>Term *</Label>
                <Controller
                  name="term"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FIRST">First Term</SelectItem>
                        <SelectItem value="SECOND">Second Term</SelectItem>
                        <SelectItem value="THIRD">Third Term</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Academic Year */}
              <div className="space-y-1.5">
                <Label htmlFor="academicYear">Academic Year *</Label>
                <Input
                  id="academicYear"
                  placeholder="2024/2025"
                  {...register("academicYear")}
                />
                {errors.academicYear && (
                  <p className="text-xs text-red-600">{errors.academicYear.message}</p>
                )}
              </div>

              {/* Score */}
              <div className="space-y-1.5">
                <Label htmlFor="score">Score (0–100) *</Label>
                <Input
                  id="score"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="e.g. 85"
                  {...register("score", { valueAsNumber: true })}
                />
                {errors.score && (
                  <p className="text-xs text-red-600">{errors.score.message}</p>
                )}
              </div>
            </div>

            {/* Remarks */}
            <div className="space-y-1.5">
              <Label htmlFor="remarks">
                Remarks{" "}
                <span className="text-ash">(optional)</span>
              </Label>
              <textarea
                id="remarks"
                rows={2}
                placeholder="Optional remarks for the student..."
                className="flex w-full rounded-none border border-pebble bg-white px-3 py-2 text-sm placeholder:text-ash focus:outline-none focus:ring-2 focus:ring-clay focus:border-transparent resize-none"
                {...register("remarks")}
              />
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Result"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* My Results Table */}
      <Card className="  ">
        <CardHeader>
          <CardTitle className="text-base">My Entered Results</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {myResults.length === 0 ? (
            <div className="p-8 text-center text-ash text-sm">
              No results entered yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myResults.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-bold">
                      {r.studentName}
                    </TableCell>
                    <TableCell className="text-sm">{r.subjectName}</TableCell>
                    <TableCell className="text-sm capitalize">
                      {r.term.toLowerCase()} Term
                    </TableCell>
                    <TableCell className="text-sm text-ash">
                      {r.academicYear}
                    </TableCell>
                    <TableCell>
                      <span className="font-bold">{r.score}</span>
                      <span className="text-ash text-xs">/100</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-ink">
                        {r.grade}
                      </span>
                    </TableCell>
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
