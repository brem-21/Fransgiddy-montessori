"use client";

import React, { useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Printer, GraduationCap } from "lucide-react";
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
import { resultApi } from "@/lib/api";
import { useMyStudents } from "@/hooks/use-my-students";
import { toast } from "@/hooks/use-toast";
import type { ReportCard } from "@/types";

const schema = z.object({
  studentId: z.string().min(1, "Select a student"),
  term: z.enum(["FIRST", "SECOND", "THIRD"]),
  academicYear: z
    .string()
    .min(1, "Academic year required")
    .regex(/^\d{4}\/\d{4}$/, "Format: YYYY/YYYY"),
  schoolReopens: z.string().optional().default(""),
});

type FormData = z.infer<typeof schema>;

const termLabel: Record<string, string> = {
  FIRST: "First Term",
  SECOND: "Second Term",
  THIRD: "Third Term",
};

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const REMARKS_PRESETS: Record<"good" | "mid" | "bad", string[]> = {
  good: [
    "Excellent performance! Keep up the outstanding work.",
    "Outstanding results this term. We are very proud of your dedication.",
    "Exceptional effort and achievement. Well done!",
  ],
  mid: [
    "Good effort this term. With more focus and dedication, even better results are achievable.",
    "A satisfactory performance. We encourage more practice and consistent study at home.",
    "Decent work! There is room for improvement with more consistent effort.",
  ],
  bad: [
    "More effort is needed. Please encourage your child to study harder and seek help when needed.",
    "Below expectations this term. Additional support and practice at home is strongly recommended.",
    "We encourage more dedication to studies. Let us work together to improve performance next term.",
  ],
};

function getRemarksCategory(average: number): "good" | "mid" | "bad" {
  if (average >= 70) return "good";
  if (average >= 50) return "mid";
  return "bad";
}

export default function AdminReportCardPage() {
  const { students, loading: studentsLoading } = useMyStudents();
  const [reportCard, setReportCard] = useState<ReportCard | null>(null);
  const [generating, setGenerating] = useState(false);
  const [teacherRemarks, setTeacherRemarks] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { studentId: "", term: "FIRST", academicYear: "2024/2025", schoolReopens: "" },
  });

  const schoolReopens = watch("schoolReopens");

  const onGenerate = async (data: FormData) => {
    setGenerating(true);
    setReportCard(null);
    try {
      const res = await resultApi.getReportCard(
        Number(data.studentId),
        data.term,
        data.academicYear
      );
      const card = res.data.data;
      setReportCard(card);
      const cat = getRemarksCategory(card.average);
      setTeacherRemarks(REMARKS_PRESETS[cat][0]);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to generate report card.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const remarksCategory = reportCard ? getRemarksCategory(reportCard.average) : null;

  return (
    <div className="space-y-6">
      <div className="no-print">
        <h1 className="text-2xl font-bold text-ink">Report Card</h1>
        <p className="text-ash text-sm mt-1">
          Generate and print student report cards.
        </p>
      </div>

      {/* Filter Form */}
      <Card className="   no-print">
        <CardHeader>
          <CardTitle className="text-base">Select Student &amp; Period</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onGenerate)}
            className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end"
          >
            <div className="space-y-1.5">
              <Label>Student *</Label>
              <Controller
                name="studentId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={studentsLoading ? "Loading..." : "Select student..."}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.firstName} {s.lastName}
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

            <div className="space-y-1.5">
              <Label htmlFor="schoolReopens">School Reopens</Label>
              <Input
                id="schoolReopens"
                type="date"
                {...register("schoolReopens")}
              />
            </div>

            <Button type="submit" disabled={generating}>
              {generating ? "Generating..." : "Generate"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Teacher Remarks (shown after report card is generated) */}
      {reportCard && (
        <Card className="   no-print">
          <CardHeader>
            <CardTitle className="text-base">Teacher&apos;s Remarks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-ash">
              Auto-selected based on performance ({remarksCategory === "good" ? "Good" : remarksCategory === "mid" ? "Mid" : "Needs Improvement"}).
              Choose a preset or write custom remarks.
            </p>
            <div className="flex flex-wrap gap-2">
              {remarksCategory && REMARKS_PRESETS[remarksCategory].map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setTeacherRemarks(preset)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    teacherRemarks === preset
                      ? "bg-clay text-white border-ink"
                      : "bg-white text-ash border-pebble hover:border-ink"
                  }`}
                >
                  Preset {i + 1}
                </button>
              ))}
            </div>
            <textarea
              value={teacherRemarks}
              onChange={(e) => setTeacherRemarks(e.target.value)}
              rows={3}
              placeholder="Write custom teacher remarks..."
              className="w-full border border-pebble rounded-none px-3 py-2 text-sm text-ink resize-none focus:outline-none focus:ring-2 focus:ring-clay"
            />
          </CardContent>
        </Card>
      )}

      {/* Report Card Output */}
      {reportCard && (
        <>
          <div className="flex justify-end no-print">
            <Button onClick={handlePrint} variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print Report Card
            </Button>
          </div>

          {/* Printable area */}
          <div
            ref={printRef}
            id="printable-report-card"
            className="bg-white border border-pebble rounded-none p-5   max-w-3xl mx-auto"
          >
            {/* School Header */}
            <div className="text-center border-b border-pebble pb-3 mb-3">
              <div className="flex items-center justify-center gap-2 mb-1">
                <GraduationCap className="h-7 w-7 text-ink" />
                <h1 className="text-xl font-bold text-ink">
                  Fransgiddy Royal School
                </h1>
              </div>
              <p className="text-ash text-xs">
                Nurturing Curious Minds — Excellence in Montessori Education
              </p>
              <p className="text-ash text-xs">
                123 School Lane, Accra, Ghana | +233 20 000 0000
              </p>
            </div>

            {/* Title + Term inline */}
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-base font-bold text-ink uppercase tracking-wide">
                Student Report Card
              </h2>
              <p className="text-sm text-ash">
                {termLabel[reportCard.term]} — {reportCard.academicYear}
              </p>
            </div>

            {/* Student Info */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mb-3 p-3 bg-white rounded-none">
              <div>
                <span className="text-xs text-ash uppercase">Student Name</span>
                <p className="font-bold text-ink text-sm">{reportCard.studentName}</p>
              </div>
              <div>
                <span className="text-xs text-ash uppercase">Class</span>
                <p className="font-bold text-ink text-sm">{reportCard.className}</p>
              </div>
              <div>
                <span className="text-xs text-ash uppercase">Term</span>
                <p className="font-bold text-ink text-sm">{termLabel[reportCard.term]}</p>
              </div>
              <div>
                <span className="text-xs text-ash uppercase">Academic Year</span>
                <p className="font-bold text-ink text-sm">{reportCard.academicYear}</p>
              </div>
              {reportCard.position !== undefined && reportCard.totalStudents !== undefined && (
                <>
                  <div>
                    <span className="text-xs text-ash uppercase">Position</span>
                    <p className="font-bold text-ink text-sm">
                      {ordinal(reportCard.position)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-ash uppercase">Total Students</span>
                    <p className="font-bold text-ink text-sm">{reportCard.totalStudents}</p>
                  </div>
                </>
              )}
            </div>

            {/* Results Table */}
            <div className="mb-3">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white">
                    <TableHead className="font-bold text-ink py-2">Subject</TableHead>
                    <TableHead className="font-bold text-ink py-2">Score</TableHead>
                    <TableHead className="font-bold text-ink py-2">Grade</TableHead>
                    <TableHead className="font-bold text-ink py-2">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportCard.results.map((r) => (
                    <TableRow key={r.subjectName}>
                      <TableCell className="font-bold py-1.5">{r.subjectName}</TableCell>
                      <TableCell className="py-1.5">{r.score} / 100</TableCell>
                      <TableCell className="py-1.5">
                        <span className="font-bold text-ink">{r.grade}</span>
                      </TableCell>
                      <TableCell className="text-ash text-sm py-1.5">{r.remarks || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-white rounded-none mb-3">
              <div className="text-center">
                <p className="text-xs text-ash uppercase mb-0.5">Total Score</p>
                <p className="text-lg font-bold text-ink">{reportCard.totalScore.toFixed(1)}</p>
              </div>
              <div className="text-center border-x border-pebble">
                <p className="text-xs text-ash uppercase mb-0.5">Average</p>
                <p className="text-lg font-bold text-ink">{reportCard.average.toFixed(1)}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-ash uppercase mb-0.5">Overall Grade</p>
                <p className="text-lg font-bold text-ink">{reportCard.overallGrade}</p>
              </div>
            </div>

            {/* Teacher's Remarks */}
            {teacherRemarks && (
              <div className="mb-3 p-3 border border-pebble rounded-none">
                <p className="text-xs text-ash uppercase mb-0.5">Class Teacher&apos;s Remarks</p>
                <p className="text-sm text-ink italic">{teacherRemarks}</p>
              </div>
            )}

            {/* School Reopens */}
            {schoolReopens && (
              <div className="mb-3 text-center py-2 bg-green-50 rounded-none border border-green-100">
                <p className="text-sm font-bold text-green-800">
                  School Reopens on{" "}
                  {new Date(schoolReopens).toLocaleDateString("en-GH", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}

            {/* Signature line */}
            <div className="mt-4 pt-4 border-t border-pebble grid grid-cols-2 gap-8">
              <div>
                <div className="h-8 border-b border-pebble mb-1" />
                <p className="text-xs text-ash">Class Teacher&apos;s Signature</p>
              </div>
              <div>
                <div className="h-8 border-b border-pebble mb-1" />
                <p className="text-xs text-ash">Head Teacher&apos;s Signature</p>
              </div>
            </div>
          </div>

          <style
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: `
                @page { margin: 15mm; }
                @media print {
                  body * { visibility: hidden; }
                  #printable-report-card,
                  #printable-report-card * { visibility: visible; }
                  #printable-report-card {
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    border: none !important;
                    box-shadow: none !important;
                    border-radius: 0 !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    max-width: 100% !important;
                  }
                  .no-print { display: none !important; }
                }
              `,
            }}
          />
        </>
      )}
    </div>
  );
}
