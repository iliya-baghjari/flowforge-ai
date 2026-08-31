"use client";

import * as React from "react";
import Image from "next/image";
import { Check, ChevronDown, Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WorkspaceCreator } from "@/components/workspace/workspace-creator";
import { cn } from "@/lib/utils";
import { useWorkspaceStore, type WorkspaceSummary } from "@/store/workspace-store";

interface WorkspaceSwitcherProps {
  workspaces: WorkspaceSummary[];
}

export const WorkspaceSwitcher = React.memo(function WorkspaceSwitcher({ workspaces }: WorkspaceSwitcherProps) {
  const [open, setOpen] = React.useState(false);
  const [showCreator, setShowCreator] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const { currentWorkspaceId, setCurrentWorkspaceId } = useWorkspaceStore();

  const currentWorkspace =
    workspaces.find((workspace) => workspace.id === currentWorkspaceId) ?? workspaces[0] ?? null;

  React.useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;

      if (!wrapperRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, { passive: true });

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [open]);

  const handleCreateWorkspace = (workspace: WorkspaceSummary) => {
    setCurrentWorkspaceId(workspace.id);
    setShowCreator(false);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Button
        variant="outline"
        className="flex items-center gap-2 rounded-full px-3 py-2"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {currentWorkspace?.logoUrl ? (
          <Image
            src={currentWorkspace.logoUrl}
            alt={currentWorkspace.name}
            width={24}
            height={24}
            unoptimized
            className="h-6 w-6 rounded-md object-cover"
          />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-[10px] font-semibold text-primary">
            {currentWorkspace?.name?.[0]?.toUpperCase() ?? "W"}
          </div>
        )}
        <span className="max-w-35 truncate text-sm font-medium">
          {currentWorkspace?.name ?? "Workspace"}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </Button>

      {open && (
        <div className="absolute left-0 z-50 mt-2 w-72 rounded-xl border border-border/60 bg-card p-2 shadow-xl">
          <div className="mb-2 flex items-center justify-between px-2 py-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Workspaces
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1"
              onClick={() => setShowCreator((value) => !value)}
            >
              <Plus className="h-3.5 w-3.5" />
              New
            </Button>
          </div>

          {showCreator ? (
            <div className="mb-3 rounded-xl border border-border/60 bg-background/60 p-2">
              <WorkspaceCreator onCreated={handleCreateWorkspace} />
            </div>
          ) : null}

          <div className="space-y-1">
            {workspaces.map((workspace) => {
              const selected = workspace.id === currentWorkspace?.id;

              return (
                <button
                  key={workspace.id}
                  type="button"
                  onClick={() => {
                    setCurrentWorkspaceId(workspace.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent",
                    selected && "bg-primary/5",
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {workspace.logoUrl ? (
                      <Image
                        src={workspace.logoUrl}
                        alt={workspace.name}
                        width={32}
                        height={32}
                        unoptimized
                        className="h-8 w-8 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                        {workspace.name[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{workspace.name}</p>
                      <p className="truncate text-xs text-muted-foreground">/{workspace.slug}</p>
                    </div>
                  </div>

                  {selected && <Check className="h-4 w-4 text-primary" />}
                </button>
              );
            })}
          </div>

          <div className="mt-3 border-t border-border/60 pt-3">
            <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-2 py-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Workspace switch is saved in your browser.
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
