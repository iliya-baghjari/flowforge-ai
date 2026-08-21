"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  upcomingDeadlines: number;
  activeProjects: number;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description?: string;
  createdAt: Date;
  user?: {
    name?: string;
    image?: string;
  };
}

interface TaskDistribution {
  name: string;
  value: number;
}

interface BurnDownData {
  day: string;
  remaining: number;
  completed: number;
}

interface Deadline {
  id: string;
  title: string;
  date: Date;
  status: string;
}

interface RecentTaskInteraction {
  id: string;
  title: string;
  status: string;
  projectName?: string;
  lastUpdated: Date;
}

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [recentTasks, setRecentTasks] = useState<RecentTaskInteraction[]>([]);
  const [distribution, setDistribution] = useState<TaskDistribution[]>([]);
  const [burndownData, setBurndownData] = useState<BurnDownData[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, activitiesRes, recentTasksRes, distributionRes, burndownRes, deadlinesRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/dashboard/activities"),
        fetch("/api/dashboard/recent-tasks"),
        fetch("/api/dashboard/task-distribution"),
        fetch("/api/dashboard/burndown"),
        fetch("/api/dashboard/deadlines"),
      ]);

      const responses = [statsRes, activitiesRes, recentTasksRes, distributionRes, burndownRes, deadlinesRes];
      const failedResponse = responses.find((response) => !response.ok);

      if (failedResponse) {
        let errorMessage = "Failed to fetch dashboard data";

        try {
          const errorBody = await failedResponse.json();
          if (typeof errorBody?.error === "string") {
            errorMessage = errorBody.error;
          }
        } catch {
          // Ignore JSON parsing issues and keep the fallback message.
        }

        throw new Error(errorMessage);
      }

      const [statsData, activitiesData, recentTasksData, distributionData, burndownDataRes, deadlinesData] = await Promise.all([
        statsRes.json(),
        activitiesRes.json(),
        recentTasksRes.json(),
        distributionRes.json(),
        burndownRes.json(),
        deadlinesRes.json(),
      ]);

      setStats(statsData);
      setActivities(activitiesData.map((a: any) => ({
        ...a,
        createdAt: new Date(a.createdAt),
      })));
      setRecentTasks(recentTasksData.map((task: any) => ({
        ...task,
        lastUpdated: new Date(task.lastUpdated),
      })));
      setDistribution(distributionData);
      setBurndownData(burndownDataRes);
      setDeadlines(deadlinesData.map((d: any) => ({
        ...d,
        date: new Date(d.date),
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  return useMemo(
    () => ({
      stats,
      activities,
      recentTasks,
      distribution,
      burndownData,
      deadlines,
      loading,
      error,
    }),
    [activities, burndownData, deadlines, distribution, error, loading, recentTasks, stats],
  );
}
