"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { MiniCalendar } from "@/components/dashboard/mini-calendar";
import { RecentTasks } from "@/components/dashboard/recent-tasks";
import { WorkspaceCreator } from "@/components/workspace/workspace-creator";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-6"
    >
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
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
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

      {stats ? (
        <SummaryCards
          totalTasks={stats.totalTasks}
          completedTasks={stats.completedTasks}
          upcomingDeadlines={stats.upcomingDeadlines}
          activeProjects={stats.activeProjects}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="mt-4 h-9 w-16 rounded-lg" />
              <Skeleton className="mt-3 h-3 w-20 rounded-full" />
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {burndownData.length > 0 ? <BurnDownChart data={burndownData} /> : <Skeleton className="h-80 w-full rounded-2xl" />}
        </div>
        <div>
          {deadlines.length > 0 ? (
            <MiniCalendar
              deadlines={deadlines.map((d) => ({
                date: d.date,
                title: d.title,
                count: 1,
              }))}
            />
          ) : (
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <Skeleton className="h-5 w-28 rounded-full" />
              <div className="mt-4 space-y-3">
                <Skeleton className="h-9 w-full rounded-lg" />
                <Skeleton className="h-9 w-full rounded-lg" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          {distribution.length > 0 ? <TaskDistributionChart data={distribution} /> : <Skeleton className="h-80 w-full rounded-2xl" />}
        </div>
        <div className="lg:col-span-2 space-y-6">
          {activities.length > 0 ? <ActivityFeed activities={activities} /> : <EmptyState title="No activity yet" description="When your team adds tasks or updates project work, this feed will show the latest activity here." variant="sparkle" />}
          {recentTasks.length > 0 ? <RecentTasks tasks={recentTasks} /> : <EmptyState title="No recent tasks" description="Create a new task to populate this list and keep the sprint moving forward." actionLabel="Open task manager" onAction={() => window.location.assign("/dashboard/tasks")} variant="default" />}
        </div>
      </div>
    </motion.div>
  );
}
