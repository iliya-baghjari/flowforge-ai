"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Bell, Search, Sparkles, Menu, ChevronDown } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";
import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar-store";
import { useWorkspaceStore } from "@/store/workspace-store";

interface NavbarProps {
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ className }) => {
  const { toggle } = useSidebarStore();
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { setWorkspaces, workspaces } = useWorkspaceStore();

  React.useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const response = await fetch("/api/workspaces");
        if (!response.ok) return;
        const data = await response.json();
        setWorkspaces(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load workspaces:", error);
      }
    };

    loadWorkspaces();
  }, [setWorkspaces]);

  const userInitial = session?.user?.name?.[0]?.toUpperCase() || "U";

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
          <WorkspaceSwitcher workspaces={workspaces} />

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

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="ml-1 flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-2 py-1.5 hover:bg-card/80 transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-primary to-violet-600 text-sm font-semibold text-white">
                {userInitial}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{session?.user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border/60 bg-card shadow-lg z-50">
                <div className="p-3 border-b border-border/60 space-y-1">
                  <p className="text-sm font-medium">{session?.user?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
                </div>
                <div className="p-2 space-y-1">
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-3 py-2 text-sm hover:bg-accent rounded-lg transition-colors"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-3 py-2 text-sm hover:bg-accent rounded-lg transition-colors"
                  >
                    Settings
                  </Link>
                </div>
                <div className="p-2 border-t border-border/60">
                  <LogoutButton />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
