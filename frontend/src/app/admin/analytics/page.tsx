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

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<PrincipalAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);

  // Filter state (what the user is typing/selecting)
  const [startDate, setStartDate] = useState(firstOfMonth());
  const [endDate, setEndDate] = useState(today());
  const [teacherId, setTeacherId] = useState<string>("ALL");
  const [studentId, setStudentId] = useState<string>("ALL");
  const [className, setClassName] = useState<string>("ALL");

  // Applied state (what was last fetched)
  const [appliedStart, setAppliedStart] = useState(firstOfMonth());
  const [appliedEnd, setAppliedEnd] = useState(today());
  const [appliedTeacherId, setAppliedTeacherId] = useState<string>("ALL");
  const [appliedStudentId, setAppliedStudentId] = useState<string>("ALL");
  const [appliedClassName, setAppliedClassName] = useState<string>("ALL");

  // Load teachers, students, and classes for filter dropdowns
  useEffect(() => {
    const loadFilters = async () => {
      const [usersRes, studentsRes] = await Promise.allSettled([
        userApi.getAll(),
        studentApi.getAll(),
      ]);
      if (usersRes.status === "fulfilled") {
        setTeachers(
          usersRes.value.data.data.filter((u) => u.role === "TEACHER")
        );
      }
      if (studentsRes.status === "fulfilled") {
        setStudents(
          studentsRes.value.data.data.filter((s) => s.active)
        );
      }
      classApi.getAll().then((res) => setClasses(res.data.data)).catch(() => {});
    };
    loadFilters();
  }, []);

  const fetchAnalytics = useCallback(
    async (
      start: string,
      end: string,
      tId: string,
      sId: string,
      cName: string
    ) => {
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
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? "Failed to load analytics.";
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

  const summaryCards = analytics
    ? [
        {
          title: "Total Collected",
          value: formatGHS(analytics.totalAmount),
          bg: "bg-indigo-50",
          color: "text-indigo-600",
        },
        {
          title: "Total Transactions",
          value: String(analytics.feeCount),
          bg: "bg-blue-50",
          color: "text-blue-600",
        },
        {
          title: "Today's Collections",
          value: formatGHS(analytics.todayAmount),
          bg: "bg-green-50",
          color: "text-green-600",
        },
        {
          title: "Today's Transactions",
          value: String(analytics.todayCount),
          bg: "bg-amber-50",
          color: "text-amber-600",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          School Fee Analytics
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Overview of all fee collections across teachers and students.
        </p>
      </div>

      {/* Filter Bar */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-44"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-44"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Teacher</Label>
              <Select
                value={teacherId}
                onValueChange={setTeacherId}
              >
                <SelectTrigger className="w-52">
                  <SelectValue placeholder="All Teachers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Teachers</SelectItem>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Student</Label>
              <Select
                value={studentId}
                onValueChange={setStudentId}
              >
                <SelectTrigger className="w-52">
                  <SelectValue placeholder="All Students" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Students</SelectItem>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.firstName} {s.lastName} — {s.className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Class</Label>
              <Select value={className} onValueChange={setClassName}>
                <SelectTrigger className="w-44">
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
            <Button onClick={handleApply} disabled={loading}>
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="py-16 text-center text-gray-400">
          Loading analytics...
        </div>
      )}

      {error && !loading && (
        <div className="py-8 text-center text-red-500">{error}</div>
      )}

      {!loading && analytics && (
        <>
          {/* Summary Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryCards.map((card) => (
              <Card key={card.title} className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-2xl font-bold ${card.color}`}>
                    {card.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Collections by Teacher */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">
                Collections by Teacher
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {analytics.byTeacher.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No data for this period.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Total Collected (₵)</TableHead>
                      <TableHead>Transactions</TableHead>
                      <TableHead>Avg per Transaction (₵)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...analytics.byTeacher]
                      .sort((a, b) => b.totalAmount - a.totalAmount)
                      .map((t) => (
                        <TableRow key={t.teacherId}>
                          <TableCell className="font-medium">
                            {t.teacherName}
                          </TableCell>
                          <TableCell className="font-semibold text-indigo-700">
                            {formatGHS(t.totalAmount)}
                          </TableCell>
                          <TableCell className="text-gray-500">
                            {t.count}
                          </TableCell>
                          <TableCell className="text-gray-500">
                            {t.count > 0
                              ? formatGHS(t.totalAmount / t.count)
                              : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Top Students */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Top Students</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {analytics.topStudents.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No data for this period.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Total (₵)</TableHead>
                      <TableHead>Transactions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...analytics.topStudents]
                      .sort((a, b) => b.totalAmount - a.totalAmount)
                      .map((s) => (
                        <TableRow key={s.studentId}>
                          <TableCell className="font-medium">
                            {s.studentName}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {s.className}
                          </TableCell>
                          <TableCell className="font-semibold text-indigo-700">
                            {formatGHS(s.totalAmount)}
                          </TableCell>
                          <TableCell className="text-gray-500">
                            {s.count}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Daily Breakdown */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Daily Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {analytics.dailyTrend.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No data for this period.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Total (₵)</TableHead>
                      <TableHead>Transactions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...analytics.dailyTrend]
                      .sort(
                        (a, b) =>
                          new Date(b.date).getTime() -
                          new Date(a.date).getTime()
                      )
                      .map((d) => (
                        <TableRow key={d.date}>
                          <TableCell className="font-medium">
                            {new Date(d.date).toLocaleDateString("en-GH", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell className="font-semibold text-indigo-700">
                            {formatGHS(d.totalAmount)}
                          </TableCell>
                          <TableCell className="text-gray-500">
                            {d.count}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Recent Entries */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Recent Entries</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {analytics.recentEntries.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No entries found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Amount (₵)</TableHead>
                      <TableHead>Collected By</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.recentEntries.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(f.feeDate).toLocaleDateString("en-GH", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="font-medium">
                          {f.studentName}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {f.studentClass}
                        </TableCell>
                        <TableCell className="font-semibold text-indigo-700">
                          {formatGHS(f.amount)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {f.collectedByName}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {f.description || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
