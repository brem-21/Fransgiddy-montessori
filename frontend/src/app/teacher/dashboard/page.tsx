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
        <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, {user?.name}. Ready to make a difference today?
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-500">
                Results Entered
              </CardTitle>
              <div className="bg-indigo-50 p-2 rounded-lg">
                <BarChart2 className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-7 w-12 bg-gray-100 animate-pulse rounded" />
            ) : (
              <p className="text-3xl font-bold text-gray-900">{resultsCount}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-500">
                Active Students
              </CardTitle>
              <div className="bg-blue-50 p-2 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-7 w-12 bg-gray-100 animate-pulse rounded" />
            ) : (
              <p className="text-3xl font-bold text-gray-900">{studentsCount}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">Currently enrolled</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-500">
                Quick Action
              </CardTitle>
              <div className="bg-green-50 p-2 rounded-lg">
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
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link
              href="/teacher/results"
              className="flex items-center gap-3 p-4 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              <BarChart2 className="h-5 w-5" />
              <span className="font-medium text-sm">Enter / View Results</span>
            </Link>
            <Link
              href="/teacher/report-card"
              className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <BookOpen className="h-5 w-5" />
              <span className="font-medium text-sm">Generate Report Card</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
