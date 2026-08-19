"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, Circle, FolderKanban } from "lucide-react";

interface RecentTask {
  id: string;
  title: string;
  status: string;
  projectName?: string;
  lastUpdated: Date;
}

interface RecentTasksProps {
  tasks: RecentTask[];
}

const statusStyles: Record<string, string> = {
  todo: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  in_progress: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  in_review: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

const statusLabels: Record<string, string> = {
  todo: "To do",
  in_progress: "In progress",
  in_review: "In review",
  completed: "Completed",
};

export function RecentTasks({ tasks }: RecentTasksProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Recent Tasks</h2>
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Last 5
        </span>
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-4">
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li key={task.id}>
              <Link
                href={`/dashboard/tasks/${task.id}`}
                className="group flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-background/60 p-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Circle className="h-2.5 w-2.5 fill-current text-primary" />
                    <p className="truncate font-medium text-foreground">{task.title}</p>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className={`rounded-full px-2 py-1 font-medium ${statusStyles[task.status] ?? "bg-muted text-muted-foreground"}`}>
                      {statusLabels[task.status] ?? task.status}
                    </span>
                    {task.projectName && (
                      <span className="inline-flex items-center gap-1">
                        <FolderKanban className="h-3.5 w-3.5" />
                        {task.projectName}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Updated {formatDistanceToNow(new Date(task.lastUpdated), { addSuffix: true })}
                  </p>
                </div>

                <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary">
                  Open
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
