"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  UserSquare,
  ClipboardList,
  BookOpen,
  GraduationCap,
  LogOut,
  BarChart2,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const adminLinks: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    label: "Content",
    href: "/admin/content",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: <Users className="h-4 w-4" />,
  },
  {
    label: "Students",
    href: "/admin/students",
    icon: <UserSquare className="h-4 w-4" />,
  },
  {
    label: "Registrations",
    href: "/admin/registrations",
    icon: <ClipboardList className="h-4 w-4" />,
  },
  {
    label: "Fees Analytics",
    href: "/admin/analytics",
    icon: <TrendingUp className="h-4 w-4" />,
  },
];

const teacherLinks: NavItem[] = [
  {
    label: "Dashboard",
    href: "/teacher/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    label: "Results",
    href: "/teacher/results",
    icon: <BarChart2 className="h-4 w-4" />,
  },
  {
    label: "Report Card",
    href: "/teacher/report-card",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    label: "Enter Fees",
    href: "/teacher/fees",
    icon: <DollarSign className="h-4 w-4" />,
  },
  {
    label: "My Analytics",
    href: "/teacher/analytics",
    icon: <BarChart2 className="h-4 w-4" />,
  },
];

interface SidebarProps {
  role: "PRINCIPAL" | "TEACHER";
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const links = role === "PRINCIPAL" ? adminLinks : teacherLinks;

  return (
    <aside className="flex flex-col w-64 bg-indigo-900 text-white min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-indigo-700">
        <GraduationCap className="h-7 w-7 text-indigo-200" />
        <div className="leading-tight">
          <p className="text-sm font-bold text-white">Fransgiddy</p>
          <p className="text-xs text-indigo-300">Montessori</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-700 text-white"
                  : "text-indigo-200 hover:bg-indigo-800 hover:text-white"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-indigo-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-200 hover:bg-indigo-800 hover:text-white transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
