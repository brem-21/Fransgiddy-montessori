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
        <h1 className="text-2xl font-bold text-gray-900">Report Card</h1>
        <p className="text-gray-500 text-sm mt-1">
          Generate and print student report cards.
        </p>
      </div>

      {/* Filter Form */}
      <Card className="border-0 shadow-sm no-print">
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
        <Card className="border-0 shadow-sm no-print">
          <CardHeader>
            <CardTitle className="text-base">Teacher&apos;s Remarks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-gray-500">
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
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
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
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm max-w-3xl mx-auto"
          >
            {/* School Header */}
            <div className="text-center border-b border-gray-200 pb-6 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <GraduationCap className="h-8 w-8 text-indigo-600" />
                <h1 className="text-2xl font-bold text-indigo-700">
                  Fransgiddy Royal School
                </h1>
              </div>
              <p className="text-gray-500 text-sm">
                Nurturing Curious Minds — Excellence in Montessori Education
              </p>
              <p className="text-gray-400 text-xs mt-1">
                123 School Lane, Accra, Ghana | +233 20 000 0000
              </p>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide">
                Student Report Card
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {termLabel[reportCard.term]} — {reportCard.academicYear}
              </p>
            </div>

            {/* Student Info */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-xs text-gray-500 uppercase">Student Name</span>
                <p className="font-semibold text-gray-900">{reportCard.studentName}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase">Class</span>
                <p className="font-semibold text-gray-900">{reportCard.className}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase">Term</span>
                <p className="font-semibold text-gray-900">{termLabel[reportCard.term]}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase">Academic Year</span>
                <p className="font-semibold text-gray-900">{reportCard.academicYear}</p>
              </div>
              {reportCard.position !== undefined && reportCard.totalStudents !== undefined && (
                <>
                  <div>
                    <span className="text-xs text-gray-500 uppercase">Position</span>
                    <p className="font-semibold text-indigo-700 text-lg">
                      {ordinal(reportCard.position)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase">Total Students</span>
                    <p className="font-semibold text-gray-900">{reportCard.totalStudents}</p>
                  </div>
                </>
              )}
            </div>

            {/* Results Table */}
            <div className="mb-6">
              <Table>
                <TableHeader>
                  <TableRow className="bg-indigo-50">
                    <TableHead className="font-bold text-gray-700">Subject</TableHead>
                    <TableHead className="font-bold text-gray-700">Score</TableHead>
                    <TableHead className="font-bold text-gray-700">Grade</TableHead>
                    <TableHead className="font-bold text-gray-700">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportCard.results.map((r) => (
                    <TableRow key={r.subjectName}>
                      <TableCell className="font-medium">{r.subjectName}</TableCell>
                      <TableCell>{r.score} / 100</TableCell>
                      <TableCell>
                        <span className="font-bold text-indigo-600">{r.grade}</span>
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">{r.remarks || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-indigo-50 rounded-lg mb-6">
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase mb-1">Total Score</p>
                <p className="text-xl font-bold text-gray-900">{reportCard.totalScore.toFixed(1)}</p>
              </div>
              <div className="text-center border-x border-indigo-200">
                <p className="text-xs text-gray-500 uppercase mb-1">Average</p>
                <p className="text-xl font-bold text-gray-900">{reportCard.average.toFixed(1)}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase mb-1">Overall Grade</p>
                <p className="text-xl font-bold text-indigo-600">{reportCard.overallGrade}</p>
              </div>
            </div>

            {/* Teacher's Remarks */}
            {teacherRemarks && (
              <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-500 uppercase mb-1">Class Teacher&apos;s Remarks</p>
                <p className="text-sm text-gray-800 italic">{teacherRemarks}</p>
              </div>
            )}

            {/* School Reopens */}
            {schoolReopens && (
              <div className="mb-6 text-center py-3 bg-green-50 rounded-lg border border-green-100">
                <p className="text-sm font-semibold text-green-800">
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
            <div className="mt-8 pt-6 border-t border-gray-200 grid grid-cols-2 gap-8">
              <div>
                <div className="h-10 border-b border-gray-300 mb-1" />
                <p className="text-xs text-gray-400">Class Teacher&apos;s Signature</p>
              </div>
              <div>
                <div className="h-10 border-b border-gray-300 mb-1" />
                <p className="text-xs text-gray-400">Head Teacher&apos;s Signature</p>
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
