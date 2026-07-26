"use client";

import React, { useEffect, useState } from "react";
import { Users, UserSquare, ClipboardList, Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  studentApi,
  userApi,
  registrationApi,
  announcementApi,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  pendingRegistrations: number;
  publishedAnnouncements: number;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalTeachers: 0,
    pendingRegistrations: 0,
    publishedAnnouncements: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, usersRes, registrationsRes, announcementsRes] =
          await Promise.allSettled([
            studentApi.getAll(),
            userApi.getAll(),
            registrationApi.getAll(),
            announcementApi.getAll(),
          ]);

        const students =
          studentsRes.status === "fulfilled"
            ? studentsRes.value.data.data
            : [];
        const users =
          usersRes.status === "fulfilled" ? usersRes.value.data.data : [];
        const registrations =
          registrationsRes.status === "fulfilled"
            ? registrationsRes.value.data.data
            : [];
        const announcements =
          announcementsRes.status === "fulfilled"
            ? announcementsRes.value.data.data
            : [];

        setStats({
          totalStudents: students.filter((s) => s.active).length,
          totalTeachers: users.filter((u) => u.role === "TEACHER" && u.active)
            .length,
          pendingRegistrations: registrations.filter(
            (r) => r.status === "PENDING"
          ).length,
          publishedAnnouncements: announcements.filter((a) => a.published)
            .length,
        });
      } catch {
        // stats will remain at defaults
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: <UserSquare className="h-5 w-5 text-ink" />,
      bg: "bg-white",
    },
    {
      title: "Teachers",
      value: stats.totalTeachers,
      icon: <Users className="h-5 w-5 text-blue-600" />,
      bg: "bg-blue-50",
    },
    {
      title: "Pending Registrations",
      value: stats.pendingRegistrations,
      icon: <ClipboardList className="h-5 w-5 text-amber-600" />,
      bg: "bg-amber-50",
    },
    {
      title: "Published Announcements",
      value: stats.publishedAnnouncements,
      icon: <Megaphone className="h-5 w-5 text-green-600" />,
      bg: "bg-green-50",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Principal Dashboard</h1>
        <p className="text-ash text-sm mt-1">
          Welcome back, {user?.name}. Here&apos;s an overview.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <Card key={card.title} className="  ">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-ash">
                  {card.title}
                </CardTitle>
                <div className={`${card.bg} p-2 rounded-none`}>{card.icon}</div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-7 w-12 bg-pebble/20 animate-pulse rounded" />
              ) : (
                <p className="text-3xl font-bold text-ink">
                  {card.value}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <Card className="  ">
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Manage Students", href: "/admin/students", color: "bg-white text-ink hover:bg-ink" },
              { label: "View Registrations", href: "/admin/registrations", color: "bg-amber-50 text-amber-700 hover:bg-amber-100" },
              { label: "Manage Users", href: "/admin/users", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
              { label: "Manage Content", href: "/admin/content", color: "bg-green-50 text-green-700 hover:bg-green-100" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`flex items-center justify-center rounded-none p-4 text-sm font-bold transition-colors ${link.color}`}
              >
                {link.label}
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
