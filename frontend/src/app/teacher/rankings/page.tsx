"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { classApi, resultApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type { SchoolClass, Rankings } from "@/types";
import { Trophy } from "lucide-react";

const TERMS = ["FIRST", "SECOND", "THIRD"];

function gradeColor(grade: string) {
  if (grade === "A") return "text-green-600 font-bold";
  if (grade === "B") return "text-blue-600 font-bold";
  if (grade === "C") return "text-yellow-600 font-bold";
  if (grade === "D") return "text-orange-500 font-bold";
  return "text-red-600 font-bold";
}

function rankBadge(rank: number) {
  if (rank === 1) return "bg-yellow-100 text-yellow-800 border-yellow-300";
  if (rank === 2) return "bg-gray-100 text-gray-700 border-gray-300";
  if (rank === 3) return "bg-orange-100 text-orange-700 border-orange-300";
  return "bg-white text-gray-600";
}

export default function TeacherRankingsPage() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [selectedTerm, setSelectedTerm] = useState("FIRST");
  const [academicYear, setAcademicYear] = useState("2025/2026");
  const [rankings, setRankings] = useState<Rankings | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    classApi.myClasses()
      .then((res) => setClasses(res.data.data))
      .catch(() => {});
  }, []);

  const fetchRankings = async () => {
    if (selectedClass === "ALL") {
      toast({ title: "Select a class", description: "Please select a specific class.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await resultApi.rankings(selectedClass, selectedTerm, academicYear);
      setRankings(res.data.data);
    } catch {
      toast({ title: "Error", description: "Failed to load rankings.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Rankings</h1>
        <p className="text-gray-500 text-sm mt-1">
          View class rankings by subject scores.
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label>Class *</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Select a class</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Term</Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TERMS.map((t) => (
                    <SelectItem key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()} Term</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Academic Year</Label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025/2026">2025/2026</SelectItem>
                  <SelectItem value="2024/2025">2024/2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={fetchRankings} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
              {loading ? "Loading..." : "View Rankings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {rankings && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              {selectedClass} — {selectedTerm.charAt(0) + selectedTerm.slice(1).toLowerCase()} Term Rankings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {rankings.rankings.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No results found for this selection.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-purple-50">
                    <TableHead className="font-bold">Rank</TableHead>
                    <TableHead className="font-bold">Student</TableHead>
                    {rankings.subjects.map((s) => (
                      <TableHead key={s} className="text-center font-medium text-sm">{s}</TableHead>
                    ))}
                    <TableHead className="text-center font-bold">Total</TableHead>
                    <TableHead className="text-center font-bold">Average</TableHead>
                    <TableHead className="text-center font-bold">Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankings.rankings.map((row) => (
                    <TableRow key={row.studentId} className="hover:bg-purple-50/50">
                      <TableCell>
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full border text-sm font-bold ${rankBadge(row.rank)}`}>
                          {row.rank}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{row.studentName}</TableCell>
                      {rankings.subjects.map((s) => (
                        <TableCell key={s} className="text-center">
                          {row.scores[s] !== undefined ? row.scores[s].toFixed(1) : <span className="text-gray-300">—</span>}
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-semibold text-purple-700">{row.total.toFixed(1)}</TableCell>
                      <TableCell className="text-center text-gray-600">{row.average.toFixed(1)}</TableCell>
                      <TableCell className={`text-center ${gradeColor(row.overallGrade)}`}>{row.overallGrade}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
