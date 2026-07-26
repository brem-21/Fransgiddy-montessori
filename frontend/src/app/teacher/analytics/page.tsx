"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { feeApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type { TeacherAnalytics } from "@/types";

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

export default function TeacherAnalyticsPage() {
  const [analytics, setAnalytics] = useState<TeacherAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState(firstOfMonth());
  const [endDate, setEndDate] = useState(today());

  const [appliedStart, setAppliedStart] = useState(firstOfMonth());
  const [appliedEnd, setAppliedEnd] = useState(today());

  const fetchAnalytics = useCallback(
    async (start: string, end: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await feeApi.myAnalytics({
          startDate: start,
          endDate: end,
        });
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
    fetchAnalytics(appliedStart, appliedEnd);
  }, [fetchAnalytics, appliedStart, appliedEnd]);

  const handleApply = () => {
    setAppliedStart(startDate);
    setAppliedEnd(endDate);
  };

  const summaryCards = analytics
    ? [
        {
          title: "Total Collected",
          value: formatGHS(analytics.totalAmount),
          bg: "bg-white",
          color: "text-ink",
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
        <h1 className="text-2xl font-bold text-ink">My Fee Analytics</h1>
        <p className="text-ash text-sm mt-1">
          Track your fee collection performance over time.
        </p>
      </div>

      {/* Date Filter */}
      <Card className="  ">
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
            <Button onClick={handleApply} disabled={loading}>
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="py-16 text-center text-ash">
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
              <Card key={card.title} className="  ">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-ash">
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

          {/* Top Students Table */}
          <Card className="  ">
            <CardHeader>
              <CardTitle className="text-base">
                Top Students by Amount
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {analytics.topStudents.length === 0 ? (
                <div className="p-8 text-center text-ash text-sm">
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
                          <TableCell className="font-bold">
                            {s.studentName}
                          </TableCell>
                          <TableCell className="text-sm text-ash">
                            {s.className}
                          </TableCell>
                          <TableCell className="font-bold text-ink">
                            {formatGHS(s.totalAmount)}
                          </TableCell>
                          <TableCell className="text-ash">
                            {s.count}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Daily Trend Table */}
          <Card className="  ">
            <CardHeader>
              <CardTitle className="text-base">Daily Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {analytics.dailyTrend.length === 0 ? (
                <div className="p-8 text-center text-ash text-sm">
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
                          <TableCell className="font-bold">
                            {new Date(d.date).toLocaleDateString("en-GH", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell className="font-bold text-ink">
                            {formatGHS(d.totalAmount)}
                          </TableCell>
                          <TableCell className="text-ash">
                            {d.count}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Recent Entries Table */}
          <Card className="  ">
            <CardHeader>
              <CardTitle className="text-base">Recent Fee Entries</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {analytics.recentEntries.length === 0 ? (
                <div className="p-8 text-center text-ash text-sm">
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
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.recentEntries.slice(0, 20).map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="text-sm text-ash">
                          {new Date(f.feeDate).toLocaleDateString("en-GH", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="font-bold">
                          {f.studentName}
                        </TableCell>
                        <TableCell className="text-sm text-ash">
                          {f.studentClass}
                        </TableCell>
                        <TableCell className="font-bold text-ink">
                          {formatGHS(f.amount)}
                        </TableCell>
                        <TableCell className="text-sm text-ash">
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
