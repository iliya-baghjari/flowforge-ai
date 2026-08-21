"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { MiniCalendar } from "@/components/dashboard/mini-calendar";
import { RecentTasks } from "@/components/dashboard/recent-tasks";
import { WorkspaceCreator } from "@/components/workspace/workspace-creator";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardData } from "@/hooks/use-dashboard-data";

const BurnDownChart = dynamic(
  () => import("@/components/dashboard/burn-down-chart").then((module) => module.BurnDownChart),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-border/60 bg-card p-6">
        <Skeleton className="h-75 w-full rounded-xl" />
      </div>
    ),
  },
);

const TaskDistributionChart = dynamic(
  () => import("@/components/dashboard/task-distribution-chart").then((module) => module.TaskDistributionChart),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-border/60 bg-card p-6">
        <Skeleton className="h-75 w-full rounded-xl" />
      </div>
    ),
  },
);

export default function DashboardPage() {
  const { stats, activities, recentTasks, distribution, burndownData, deadlines, loading, error } = useDashboardData();

  if (error) {
    return (
      <div className="space-y-6">
        <section className="rounded-2xl border border-border/60 bg-card p-6">
          <p className="text-center text-sm text-red-600">Error loading dashboard: {error}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border/60 bg-linear-to-br from-primary/10 via-background to-violet-500/10 p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Project Management Dashboard
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Welcome back to your workspace
            </h1>
            <p className="text-sm leading-7 text-muted-foreground sm:text-base">
              Track your projects, tasks, and progress all in one place. Stay on top of deadlines and celebrate completed work.
            </p>
          </div>
          <Link href="/dashboard/projects" className="w-fit">
            <Button className="w-fit">
              New Project
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <WorkspaceCreator />
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Workspace status
          </p>
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="text-lg font-semibold text-foreground">Northstar Labs</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Slug</p>
              <p className="text-lg font-semibold text-foreground">/northstar-labs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {stats && (
        <SummaryCards
          totalTasks={stats.totalTasks}
          completedTasks={stats.completedTasks}
          upcomingDeadlines={stats.upcomingDeadlines}
          activeProjects={stats.activeProjects}
        />
      )}

      {/* Charts and Calendar */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {burndownData.length > 0 && <BurnDownChart data={burndownData} />}
        </div>
        <div>
          {deadlines.length > 0 && <MiniCalendar deadlines={deadlines.map((d) => ({
            date: d.date,
            title: d.title,
            count: 1,
          }))} />}
        </div>
      </div>

      {/* Task Distribution and Activity Feed */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          {distribution.length > 0 && <TaskDistributionChart data={distribution} />}
        </div>
        <div className="lg:col-span-2 space-y-6">
          {activities.length > 0 && <ActivityFeed activities={activities} />}
          {recentTasks.length > 0 && <RecentTasks tasks={recentTasks} />}
        </div>
      </div>
    </div>
  );
}
