"use client";

import * as React from "react";

import { shortcutHelpEntries } from "@/lib/shortcuts";

interface ShortcutHelpProps {
  open: boolean;
  onClose: () => void;
}

export function ShortcutHelp({ open, onClose }: ShortcutHelpProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Keyboard shortcuts</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground"
            aria-label="Close shortcuts help"
          >
            Esc
          </button>
        </div>

        <ul className="space-y-3">
          {shortcutHelpEntries.map((entry) => (
            <li key={entry.key} className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-3 py-2">
              <span className="text-sm text-muted-foreground">{entry.description}</span>
              <kbd className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground">
                {entry.key}
              </kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
