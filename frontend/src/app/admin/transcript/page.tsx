"use client";

import React, { useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Printer, Download, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
import type { Transcript, TranscriptTerm } from "@/types";

const schema = z.object({
  studentId: z.string().min(1, "Select a student"),
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

function gradeColor(grade: string) {
  if (grade === "A") return "text-green-700 font-bold";
  if (grade === "B") return "text-blue-700 font-bold";
  if (grade === "C") return "text-yellow-700 font-bold";
  if (grade === "D") return "text-orange-600 font-bold";
  return "text-red-600 font-bold";
}

function buildCSV(transcript: Transcript): string {
  const rows: string[] = [];
  const q = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

  rows.push(`${q("STUDENT ACADEMIC TRANSCRIPT")}`);
  rows.push(`${q("School")},${q("Fransgiddy Royal School")}`);
  rows.push(`${q("Student")},${q(transcript.studentName)}`);
  rows.push(`${q("Class")},${q(transcript.className)}`);
  rows.push(`${q("Parent/Guardian")},${q(transcript.parentName)}`);
  rows.push(`${q("Parent Phone")},${q(transcript.parentPhone)}`);
  rows.push(`${q("Enrolled")},${q(transcript.enrollmentDate)}`);
  rows.push("");

  transcript.terms.forEach((t) => {
    rows.push(`${q("Academic Year")},${q(t.academicYear)}`);
    rows.push(`${q("Term")},${q(termLabel[t.term] || t.term)}`);
    rows.push(`${q("Subject")},${q("Score")},${q("Grade")},${q("Remarks")}`);
    t.subjects.forEach((s) => {
      rows.push(`${q(s.subjectName)},${q(s.score)},${q(s.grade)},${q(s.remarks || "")}`);
    });
    rows.push(`${q("Total Score")},${q(t.totalScore.toFixed(1))}`);
    rows.push(`${q("Average")},${q(t.average.toFixed(1) + "%")}`);
    rows.push(`${q("Overall Grade")},${q(t.overallGrade)}`);
    rows.push(`${q("Position")},${q(ordinal(t.position) + " out of " + t.totalStudents + " students")}`);
    rows.push("");
  });

  // Cumulative summary
  if (transcript.terms.length > 1) {
    const cumAvg = transcript.terms.reduce((s, t) => s + t.average, 0) / transcript.terms.length;
    const cumGrade = cumAvg >= 80 ? "A" : cumAvg >= 70 ? "B" : cumAvg >= 60 ? "C" : cumAvg >= 50 ? "D" : "F";
    rows.push(`${q("CUMULATIVE SUMMARY")}`);
    rows.push(`${q("Terms Completed")},${q(transcript.terms.length)}`);
    rows.push(`${q("Cumulative Average")},${q(cumAvg.toFixed(1) + "%")}`);
    rows.push(`${q("Cumulative Grade")},${q(cumGrade)}`);
  }

  return rows.join("\n");
}

function downloadCSV(transcript: Transcript) {
  const csv = buildCSV(transcript);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `transcript_${transcript.studentName.replace(/\s+/g, "_")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminTranscriptPage() {
  const { students, loading: studentsLoading } = useMyStudents();
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [generating, setGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { studentId: "" },
  });

  const onGenerate = async (data: FormData) => {
    setGenerating(true);
    setTranscript(null);
    try {
      const res = await resultApi.getTranscript(Number(data.studentId));
      setTranscript(res.data.data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to generate transcript.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  // Cumulative stats across all terms
  const cumAvg = transcript
    ? transcript.terms.reduce((s, t) => s + t.average, 0) / transcript.terms.length
    : 0;
  const cumGrade =
    cumAvg >= 80 ? "A" : cumAvg >= 70 ? "B" : cumAvg >= 60 ? "C" : cumAvg >= 50 ? "D" : "F";

  return (
    <div className="space-y-6">
      <div className="no-print">
        <h1 className="text-2xl font-bold text-gray-900">Student Transcript</h1>
        <p className="text-gray-500 text-sm mt-1">
          Generate and export a full academic transcript for any student.
        </p>
      </div>

      {/* Student selector */}
      <Card className="border-0 shadow-sm no-print">
        <CardHeader>
          <CardTitle className="text-base">Select Student</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onGenerate)} className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5 flex-1 min-w-[200px]">
              <Label>Student *</Label>
              <Controller
                name="studentId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={studentsLoading ? "Loading..." : "Select student..."} />
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
            <Button type="submit" disabled={generating}>
              {generating ? "Generating..." : "Generate Transcript"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Action buttons */}
      {transcript && (
        <div className="flex gap-3 justify-end no-print">
          <Button variant="outline" onClick={() => downloadCSV(transcript)}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Print / Save PDF
          </Button>
        </div>
      )}

      {/* Printable Transcript */}
      {transcript && (
        <div
          ref={printRef}
          id="printable-transcript"
          className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm max-w-4xl mx-auto"
        >
          {/* School Header */}
          <div className="text-center border-b-2 border-indigo-600 pb-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <GraduationCap className="h-9 w-9 text-indigo-600" />
              <h1 className="text-2xl font-bold text-indigo-700">Fransgiddy Royal School</h1>
            </div>
            <p className="text-gray-500 text-sm">Nurturing Curious Minds — Excellence in Montessori Education</p>
            <p className="text-gray-400 text-xs mt-1">123 School Lane, Accra, Ghana | +233 20 000 0000</p>
          </div>

          {/* Document title */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 uppercase tracking-widest">
              Student Academic Transcript
            </h2>
            <p className="text-xs text-gray-400 mt-1">Official Academic Record</p>
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-8 p-5 bg-gray-50 rounded-lg border border-gray-100">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide">Student Name</span>
              <p className="font-bold text-gray-900 text-base">{transcript.studentName}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide">Class</span>
              <p className="font-semibold text-gray-900">{transcript.className}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide">Parent / Guardian</span>
              <p className="font-semibold text-gray-900">{transcript.parentName}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide">Parent Phone</span>
              <p className="font-semibold text-gray-900">{transcript.parentPhone}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide">Enrollment Date</span>
              <p className="font-semibold text-gray-900">
                {new Date(transcript.enrollmentDate).toLocaleDateString("en-GH", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide">Terms on Record</span>
              <p className="font-semibold text-gray-900">{transcript.terms.length}</p>
            </div>
          </div>

          {/* Terms */}
          {transcript.terms.map((t, idx) => (
            <TermSection key={idx} term={t} />
          ))}

          {/* Cumulative Summary */}
          {transcript.terms.length > 0 && (
            <div className="mt-8 border-t-2 border-indigo-600 pt-6">
              <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-wide mb-4">
                Cumulative Academic Summary
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <SummaryStat label="Terms Completed" value={String(transcript.terms.length)} />
                <SummaryStat label="Cumulative Average" value={`${cumAvg.toFixed(1)}%`} />
                <SummaryStat label="Cumulative Grade" value={cumGrade} highlight />
                <SummaryStat
                  label="Performance"
                  value={
                    cumAvg >= 80 ? "Excellent" :
                    cumAvg >= 70 ? "Very Good" :
                    cumAvg >= 60 ? "Good" :
                    cumAvg >= 50 ? "Satisfactory" : "Needs Improvement"
                  }
                />
              </div>
            </div>
          )}

          {/* Signature lines */}
          <div className="mt-10 pt-6 border-t border-gray-200 grid grid-cols-2 gap-12">
            <div>
              <div className="h-10 border-b border-gray-400 mb-1" />
              <p className="text-xs text-gray-400">Head Teacher&apos;s Signature &amp; Date</p>
            </div>
            <div>
              <div className="h-10 border-b border-gray-400 mb-1" />
              <p className="text-xs text-gray-400">School Stamp &amp; Date</p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            This is an official academic transcript of Fransgiddy Royal School. Any alteration renders it invalid.
          </p>
        </div>
      )}

      <style
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `
            @page { margin: 15mm; }
            @media print {
              body * { visibility: hidden; }
              #printable-transcript,
              #printable-transcript * { visibility: visible; }
              #printable-transcript {
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
    </div>
  );
}

function TermSection({ term }: { term: TranscriptTerm }) {
  return (
    <div className="mb-8">
      {/* Term header */}
      <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-2.5 mb-3">
        <div>
          <span className="text-sm font-bold text-indigo-800">
            {termLabel[term.term] || term.term}
          </span>
          <span className="text-xs text-indigo-500 ml-2">— {term.academicYear}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-indigo-700">
          <span>
            Position:{" "}
            <strong>{ordinal(term.position)}</strong>
            <span className="text-indigo-400"> / {term.totalStudents} students</span>
          </span>
        </div>
      </div>

      {/* Subjects table */}
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold text-gray-700 w-[40%]">Subject</TableHead>
            <TableHead className="font-semibold text-gray-700 text-center w-[15%]">Score / 100</TableHead>
            <TableHead className="font-semibold text-gray-700 text-center w-[10%]">Grade</TableHead>
            <TableHead className="font-semibold text-gray-700">Remarks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {term.subjects.map((s) => (
            <TableRow key={s.subjectName}>
              <TableCell className="font-medium">{s.subjectName}</TableCell>
              <TableCell className="text-center">{s.score.toFixed(1)}</TableCell>
              <TableCell className={`text-center ${gradeColor(s.grade)}`}>{s.grade}</TableCell>
              <TableCell className="text-sm text-gray-500">{s.remarks || "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Term summary bar */}
      <div className="flex flex-wrap gap-6 mt-3 px-3 py-2.5 bg-indigo-600 text-white rounded-lg text-sm">
        <span>
          Total Score: <strong>{term.totalScore.toFixed(1)}</strong>
        </span>
        <span>
          Average: <strong>{term.average.toFixed(1)}%</strong>
        </span>
        <span>
          Overall Grade: <strong>{term.overallGrade}</strong>
        </span>
        <span className="ml-auto">
          Position: <strong>{ordinal(term.position)} out of {term.totalStudents}</strong>
        </span>
      </div>
    </div>
  );
}

function SummaryStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="text-center p-3 bg-indigo-50 rounded-lg border border-indigo-100">
      <p className="text-xs text-gray-500 uppercase mb-1">{label}</p>
      <p className={`text-lg font-bold ${highlight ? "text-indigo-700" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}
