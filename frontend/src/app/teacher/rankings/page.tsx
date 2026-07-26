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
import { Trophy, Users } from "lucide-react";

const TERMS = ["FIRST", "SECOND", "THIRD"];

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function gradeColor(grade: string) {
  if (grade === "A") return "text-green-600 font-bold";
  if (grade === "B") return "text-blue-600 font-bold";
  if (grade === "C") return "text-yellow-600 font-bold";
  if (grade === "D") return "text-orange-500 font-bold";
  return "text-red-600 font-bold";
}

function rankBadge(rank: number) {
  if (rank === 1) return "bg-yellow-100 text-yellow-800 border border-yellow-300";
  if (rank === 2) return "bg-pebble/20 text-ink border border-pebble";
  if (rank === 3) return "bg-orange-100 text-orange-700 border border-orange-300";
  return "bg-white text-ash border border-pebble";
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
        <h1 className="text-2xl font-bold text-ink">Student Rankings</h1>
        <p className="text-ash text-sm mt-1">
          View class rankings by subject scores.
        </p>
      </div>

      <Card className="  ">
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
            <Button onClick={fetchRankings} disabled={loading} className="bg-clay hover:bg-ink/80">
              {loading ? "Loading..." : "View Rankings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {rankings && (
        <Card className="  ">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              {selectedClass} — {selectedTerm.charAt(0) + selectedTerm.slice(1).toLowerCase()} Term Rankings
              <span className="ml-auto flex items-center gap-1 text-sm font-normal text-ash">
                <Users className="h-4 w-4" />
                {rankings.rankings.length} student{rankings.rankings.length !== 1 ? "s" : ""}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {rankings.rankings.length === 0 ? (
              <div className="p-8 text-center text-ash">No results found for this selection.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-pebble/10">
                    <TableHead className="font-bold">Position</TableHead>
                    <TableHead className="font-bold">Student</TableHead>
                    {rankings.subjects.map((s) => (
                      <TableHead key={s} className="text-center font-bold text-sm">{s}</TableHead>
                    ))}
                    <TableHead className="text-center font-bold">Total</TableHead>
                    <TableHead className="text-center font-bold">Average</TableHead>
                    <TableHead className="text-center font-bold">Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankings.rankings.map((row) => (
                    <TableRow key={row.studentId} className="hover:bg-pebble/10">
                      <TableCell>
                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-sm font-bold ${rankBadge(row.rank)}`}>
                          {ordinal(row.rank)}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold">{row.studentName}</TableCell>
                      {rankings.subjects.map((s) => (
                        <TableCell key={s} className="text-center">
                          {row.scores[s] !== undefined ? row.scores[s].toFixed(1) : <span className="text-ash">—</span>}
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-bold text-ink">{row.total.toFixed(1)}</TableCell>
                      <TableCell className="text-center text-ash">{row.average.toFixed(1)}</TableCell>
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
