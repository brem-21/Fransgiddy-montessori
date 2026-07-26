"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Menu } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "PRINCIPAL" | "TEACHER";
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (!user) {
    if (loading) {
      return (
        <div className="flex min-h-screen bg-white">
          {/* Sidebar skeleton */}
          <div className="hidden md:flex flex-col w-64 bg-white border-r border-pebble shrink-0">
            <div className="px-5 py-5 border-b border-pebble">
              <div className="h-7 w-36 bg-pebble/30 animate-pulse" />
            </div>
            <div className="flex-1 px-3 py-4 space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-9 bg-pebble/20 animate-pulse rounded-pill" />
              ))}
            </div>
          </div>
          {/* Content skeleton */}
          <div className="flex-1 flex flex-col">
            <div className="bg-white border-b border-pebble h-14 px-6 flex items-center gap-3">
              <div className="h-5 w-48 bg-pebble/30 animate-pulse" />
            </div>
            <div className="flex-1 p-6 space-y-4">
              <div className="h-8 w-56 bg-pebble/30 animate-pulse" />
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1,2,3,4].map((i) => <div key={i} className="h-28 bg-pebble/10 animate-pulse" />)}
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  const roleLabel = role === "PRINCIPAL" ? "Principal" : "Teacher";

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-pebble px-4 py-3 sm:px-6 sm:py-4 flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded-pill text-ash hover:bg-pebble/20 focus:outline-none flex-shrink-0 transition-transform active:scale-90"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-ash uppercase tracking-wide font-bold truncate hidden sm:block">
              {new Date().toLocaleDateString("en-GH", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-sm sm:text-base font-bold text-ink truncate">
              Welcome, <span className="text-ink">{user.name}</span>
            </p>
          </div>
          <div className="flex-shrink-0">
            <Badge variant="secondary" className="text-xs">{roleLabel}</Badge>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
