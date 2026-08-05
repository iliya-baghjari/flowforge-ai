"use client";

import * as React from "react";

import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar-store";

interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ children, className }) => {
  const { isOpen } = useSidebarStore();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />
      <main
        className={cn(
          "min-h-[calc(100vh-4rem)] px-4 py-20 transition-all duration-200 sm:px-6 lg:px-8",
          isOpen ? "lg:pl-64" : "lg:pl-0",
        )}
      >
        <div className={cn("mx-auto max-w-7xl", className)}>{children}</div>
      </main>
    </div>
  );
};
