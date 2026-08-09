"use client";

import * as React from "react";
import { Bell, Search, Sparkles, Menu } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar-store";

interface NavbarProps {
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ className }) => {
  const { toggle } = useSidebarStore();

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl",
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Toggle sidebar"
            onClick={toggle}
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-2 shadow-sm">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">FlowForge AI</p>
              <p className="text-xs text-muted-foreground">Product studio</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden gap-2 rounded-full sm:inline-flex"
            aria-label="Search workspace"
          >
            <Search className="h-4 w-4" />
            <span className="text-sm text-muted-foreground">Search</span>
          </Button>

          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>

          <ThemeToggle />

          <div className="ml-1 flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-2 py-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-primary to-violet-600 text-sm font-semibold text-white">
              AL
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium">Alicia</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
