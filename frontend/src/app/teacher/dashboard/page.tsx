"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart2, BookOpen, ClipboardCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { resultApi, studentApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const [resultsCount, setResultsCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resultsRes, studentsRes] = await Promise.allSettled([
          resultApi.myEntries(),
          studentApi.getAll(),
        ]);
        if (resultsRes.status === "fulfilled") {
          setResultsCount(resultsRes.value.data.data.length);
        }
        if (studentsRes.status === "fulfilled") {
          setStudentsCount(
            studentsRes.value.data.data.filter((s) => s.active).length
          );
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Teacher Dashboard</h1>
        <p className="text-ash text-sm mt-1">
          Welcome back, {user?.name}. Ready to make a difference today?
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card className="  ">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-ash">
                Results Entered
              </CardTitle>
              <div className="bg-white p-2 rounded-none">
                <BarChart2 className="h-5 w-5 text-ink" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-7 w-12 bg-pebble/20 animate-pulse rounded" />
            ) : (
              <p className="text-3xl font-bold text-ink">{resultsCount}</p>
            )}
            <p className="text-xs text-ash mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="  ">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-ash">
                Active Students
              </CardTitle>
              <div className="bg-blue-50 p-2 rounded-none">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-7 w-12 bg-pebble/20 animate-pulse rounded" />
            ) : (
              <p className="text-3xl font-bold text-ink">{studentsCount}</p>
            )}
            <p className="text-xs text-ash mt-1">Currently enrolled</p>
          </CardContent>
        </Card>

        <Card className="  ">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-ash">
                Quick Action
              </CardTitle>
              <div className="bg-green-50 p-2 rounded-none">
                <ClipboardCheck className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <Button asChild size="sm" className="w-full">
              <Link href="/teacher/results">Enter Results</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card className="  ">
        <CardHeader>
          <CardTitle className="text-base">Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link
              href="/teacher/results"
              className="flex items-center gap-3 p-4 rounded-none bg-white text-ink hover:bg-ink transition-colors"
            >
              <BarChart2 className="h-5 w-5" />
              <span className="font-bold text-sm">Enter / View Results</span>
            </Link>
            <Link
              href="/teacher/report-card"
              className="flex items-center gap-3 p-4 rounded-none bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <BookOpen className="h-5 w-5" />
              <span className="font-bold text-sm">Generate Report Card</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
