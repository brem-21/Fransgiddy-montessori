"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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
  Trophy,
  School,
  ClipboardCheck,
  Wallet,
  MessageSquare,
  Settings,
  Scroll,
  X,
  LibraryBig,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const adminLinks: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Content", href: "/admin/content", icon: <FileText className="h-4 w-4" /> },
  { label: "Users", href: "/admin/users", icon: <Users className="h-4 w-4" /> },
  { label: "Students", href: "/admin/students", icon: <UserSquare className="h-4 w-4" /> },
  { label: "Classes", href: "/admin/classes", icon: <School className="h-4 w-4" /> },
  { label: "Subjects", href: "/admin/subjects", icon: <LibraryBig className="h-4 w-4" /> },
  { label: "Registrations", href: "/admin/registrations", icon: <ClipboardList className="h-4 w-4" /> },
  { label: "Enter Results", href: "/admin/results", icon: <ClipboardCheck className="h-4 w-4" /> },
  { label: "Report Card", href: "/admin/report-card", icon: <BookOpen className="h-4 w-4" /> },
  { label: "Transcript", href: "/admin/transcript", icon: <Scroll className="h-4 w-4" /> },
  { label: "Enter Fees", href: "/admin/fees", icon: <Wallet className="h-4 w-4" /> },
  { label: "Fee Analytics", href: "/admin/analytics", icon: <TrendingUp className="h-4 w-4" /> },
  { label: "My Collections", href: "/admin/my-analytics", icon: <DollarSign className="h-4 w-4" /> },
  { label: "Rankings", href: "/admin/rankings", icon: <Trophy className="h-4 w-4" /> },
  { label: "Settings", href: "/admin/settings", icon: <Settings className="h-4 w-4" /> },
];

const teacherLinks: NavItem[] = [
  { label: "Dashboard", href: "/teacher/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Results", href: "/teacher/results", icon: <BarChart2 className="h-4 w-4" /> },
  { label: "Report Card", href: "/teacher/report-card", icon: <BookOpen className="h-4 w-4" /> },
  { label: "Enter Fees", href: "/teacher/fees", icon: <DollarSign className="h-4 w-4" /> },
  { label: "My Analytics", href: "/teacher/analytics", icon: <BarChart2 className="h-4 w-4" /> },
  { label: "Rankings", href: "/teacher/rankings", icon: <Trophy className="h-4 w-4" /> },
  { label: "SMS Broadcast", href: "/teacher/sms", icon: <MessageSquare className="h-4 w-4" /> },
];

interface SidebarProps {
  role: "PRINCIPAL" | "TEACHER";
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const links = role === "PRINCIPAL" ? adminLinks : teacherLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white text-ink border-r border-pebble transition-transform duration-200 ease-in-out",
          "md:relative md:translate-x-0 md:z-auto md:flex",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo + mobile close */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-pebble flex-shrink-0">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-ink" />
            <div className="leading-tight">
              <p className="text-sm font-bold text-ink tracking-tight">Fransgiddy</p>
              <p className="text-xs text-ash">Royal School</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded text-ash hover:text-ink hover:bg-pebble/20 transition-all active:scale-90"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-pill text-sm font-bold transition-colors",
                  isActive
                    ? "text-white"
                    : "text-ash hover:bg-pebble/20 hover:text-ink"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 bg-ink rounded-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-3">
                  {item.icon}
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-pebble flex-shrink-0">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-pill text-sm font-bold text-ash hover:bg-pebble/20 hover:text-ink transition-all active:scale-[0.98] w-full"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
