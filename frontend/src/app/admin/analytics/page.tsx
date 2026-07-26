"use client";

import React, { useEffect, useState, useCallback } from "react";
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
import { Download } from "lucide-react";
import { feeApi, userApi, studentApi, classApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type { PrincipalAnalytics, User, Student, SchoolClass } from "@/types";

function formatGHS(amount: number) {
  return (
    "₵" +
    amount.toLocaleString("en-GH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function firstOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function downloadCSV(rows: string[][], filename: string) {
  const csv = rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<PrincipalAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);

  const [startDate, setStartDate] = useState(firstOfMonth());
  const [endDate, setEndDate] = useState(todayStr());
  const [teacherId, setTeacherId] = useState<string>("ALL");
  const [studentId, setStudentId] = useState<string>("ALL");
  const [className, setClassName] = useState<string>("ALL");

  const [appliedStart, setAppliedStart] = useState(firstOfMonth());
  const [appliedEnd, setAppliedEnd] = useState(todayStr());
  const [appliedTeacherId, setAppliedTeacherId] = useState<string>("ALL");
  const [appliedStudentId, setAppliedStudentId] = useState<string>("ALL");
  const [appliedClassName, setAppliedClassName] = useState<string>("ALL");

  useEffect(() => {
    Promise.allSettled([userApi.getAll(), studentApi.getAll()]).then(
      ([usersRes, studentsRes]) => {
        if (usersRes.status === "fulfilled")
          setTeachers(usersRes.value.data.data.filter((u) => u.role === "TEACHER"));
        if (studentsRes.status === "fulfilled")
          setStudents(studentsRes.value.data.data.filter((s) => s.active));
      }
    );
    classApi.getAll().then((res) => setClasses(res.data.data)).catch(() => {});
  }, []);

  const fetchAnalytics = useCallback(
    async (start: string, end: string, tId: string, sId: string, cName: string) => {
      setLoading(true);
      setError(null);
      try {
        const params: {
          startDate?: string;
          endDate?: string;
          teacherId?: number;
          studentId?: number;
          className?: string;
        } = { startDate: start, endDate: end };
        if (tId && tId !== "ALL") params.teacherId = Number(tId);
        if (sId && sId !== "ALL") params.studentId = Number(sId);
        if (cName && cName !== "ALL") params.className = cName;

        const res = await feeApi.principalAnalytics(params);
        setAnalytics(res.data.data);
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ?? "Failed to load analytics.";
        setError(message);
        toast({ title: "Error", description: message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchAnalytics(appliedStart, appliedEnd, appliedTeacherId, appliedStudentId, appliedClassName);
  }, [fetchAnalytics, appliedStart, appliedEnd, appliedTeacherId, appliedStudentId, appliedClassName]);

  const handleApply = () => {
    setAppliedStart(startDate);
    setAppliedEnd(endDate);
    setAppliedTeacherId(teacherId);
    setAppliedStudentId(studentId);
    setAppliedClassName(className);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params: {
        startDate?: string;
        endDate?: string;
        teacherId?: number;
        studentId?: number;
        className?: string;
      } = { startDate: appliedStart, endDate: appliedEnd };
      if (appliedTeacherId !== "ALL") params.teacherId = Number(appliedTeacherId);
      if (appliedStudentId !== "ALL") params.studentId = Number(appliedStudentId);
      if (appliedClassName !== "ALL") params.className = appliedClassName;

      const res = await feeApi.getAllEntries(params);
      const entries = res.data.data;

      if (entries.length === 0) {
        toast({ title: "No Data", description: "No entries found for the selected filters." });
        return;
      }

      const header = ["Date", "Student", "Class", "Amount (GHS)", "Collected By", "Description"];
      const rows = entries.map((f) => [
        f.feeDate,
        f.studentName,
        f.studentClass,
        String(f.amount),
        f.collectedByName,
        f.description || "",
      ]);

      downloadCSV([header, ...rows], `fees_${appliedStart}_to_${appliedEnd}.csv`);
      toast({ title: "Exported", description: `${entries.length} entries exported to CSV.` });
    } catch {
      toast({ title: "Export Failed", description: "Could not export fee data.", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const summaryCards = analytics
    ? [
        { title: "Total Collected", value: formatGHS(analytics.totalAmount), bg: "bg-white", color: "text-ink" },
        { title: "Total Transactions", value: String(analytics.feeCount), bg: "bg-blue-50", color: "text-blue-600" },
        { title: "Today's Collections", value: formatGHS(analytics.todayAmount), bg: "bg-green-50", color: "text-green-600" },
        { title: "Today's Transactions", value: String(analytics.todayCount), bg: "bg-amber-50", color: "text-amber-600" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">School Fee Analytics</h1>
          <p className="text-ash text-sm mt-1">
            Overview of all fee collections across teachers and students.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={exporting || loading || !analytics}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <Download className="h-4 w-4" />
          {exporting ? "Exporting..." : "Export CSV"}
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="  ">
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Teacher</Label>
              <Select value={teacherId} onValueChange={setTeacherId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Teachers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Teachers</SelectItem>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Student</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Students" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Students</SelectItem>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.firstName} {s.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Class</Label>
              <Select value={className} onValueChange={setClassName}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Classes</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleApply} disabled={loading} className="w-full sm:w-auto">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="py-16 text-center text-ash">Loading analytics...</div>
      )}

      {error && !loading && (
        <div className="py-8 text-center text-red-500">{error}</div>
      )}

      {!loading && analytics && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {summaryCards.map((card) => (
              <Card key={card.title} className="  ">
                <CardHeader className="pb-1 pt-4 px-4">
                  <CardTitle className="text-xs sm:text-sm font-bold text-ash leading-tight">
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className={`text-lg sm:text-2xl font-bold ${card.color}`}>
                    {card.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Collections by Teacher */}
          <Card className="  ">
            <CardHeader>
              <CardTitle className="text-base">Collections by Teacher</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {analytics.byTeacher.length === 0 ? (
                <div className="p-8 text-center text-ash text-sm">No data for this period.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Total Collected</TableHead>
                        <TableHead>Transactions</TableHead>
                        <TableHead className="hidden sm:table-cell">Avg per Transaction</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...analytics.byTeacher]
                        .sort((a, b) => b.totalAmount - a.totalAmount)
                        .map((t) => (
                          <TableRow key={t.teacherId}>
                            <TableCell className="font-bold">{t.teacherName}</TableCell>
                            <TableCell className="font-bold text-ink">{formatGHS(t.totalAmount)}</TableCell>
                            <TableCell className="text-ash">{t.count}</TableCell>
                            <TableCell className="text-ash hidden sm:table-cell">
                              {t.count > 0 ? formatGHS(t.totalAmount / t.count) : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Students */}
          <Card className="  ">
            <CardHeader>
              <CardTitle className="text-base">Top Students</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {analytics.topStudents.length === 0 ? (
                <div className="p-8 text-center text-ash text-sm">No data for this period.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead className="hidden sm:table-cell">Class</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Transactions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...analytics.topStudents]
                        .sort((a, b) => b.totalAmount - a.totalAmount)
                        .map((s) => (
                          <TableRow key={s.studentId}>
                            <TableCell className="font-bold">{s.studentName}</TableCell>
                            <TableCell className="text-sm text-ash hidden sm:table-cell">{s.className}</TableCell>
                            <TableCell className="font-bold text-ink">{formatGHS(s.totalAmount)}</TableCell>
                            <TableCell className="text-ash">{s.count}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Breakdown */}
          <Card className="  ">
            <CardHeader>
              <CardTitle className="text-base">Daily Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {analytics.dailyTrend.length === 0 ? (
                <div className="p-8 text-center text-ash text-sm">No data for this period.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Transactions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...analytics.dailyTrend]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((d) => (
                          <TableRow key={d.date}>
                            <TableCell className="font-bold">
                              {new Date(d.date).toLocaleDateString("en-GH", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </TableCell>
                            <TableCell className="font-bold text-ink">{formatGHS(d.totalAmount)}</TableCell>
                            <TableCell className="text-ash">{d.count}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Entries */}
          <Card className="  ">
            <CardHeader>
              <CardTitle className="text-base">Recent Entries</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {analytics.recentEntries.length === 0 ? (
                <div className="p-8 text-center text-ash text-sm">No entries found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead className="hidden sm:table-cell">Class</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead className="hidden md:table-cell">Collected By</TableHead>
                        <TableHead className="hidden lg:table-cell">Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.recentEntries.map((f) => (
                        <TableRow key={f.id}>
                          <TableCell className="text-sm text-ash">
                            {new Date(f.feeDate).toLocaleDateString("en-GH", {
                              day: "numeric",
                              month: "short",
                            })}
                          </TableCell>
                          <TableCell className="font-bold">{f.studentName}</TableCell>
                          <TableCell className="text-sm text-ash hidden sm:table-cell">{f.studentClass}</TableCell>
                          <TableCell className="font-bold text-ink">{formatGHS(f.amount)}</TableCell>
                          <TableCell className="text-sm text-ash hidden md:table-cell">{f.collectedByName}</TableCell>
                          <TableCell className="text-sm text-ash hidden lg:table-cell">{f.description || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
