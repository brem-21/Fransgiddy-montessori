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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const roleLabel = role === "PRINCIPAL" ? "Principal" : "Teacher";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 flex items-center gap-3 shadow-sm">
          <button
            className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none flex-shrink-0"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium truncate hidden sm:block">
              {new Date().toLocaleDateString("en-GH", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-sm sm:text-base font-semibold text-gray-800 truncate">
              Welcome, <span className="text-purple-700">{user.name}</span>
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
