"use client";

import { useEffect, useState } from "react";

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

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [distribution, setDistribution] = useState<TaskDistribution[]>([]);
  const [burndownData, setBurndownData] = useState<BurnDownData[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsRes, activitiesRes, distributionRes, burndownRes, deadlinesRes] = await Promise.all([
          fetch("/api/dashboard/stats"),
          fetch("/api/dashboard/activities"),
          fetch("/api/dashboard/task-distribution"),
          fetch("/api/dashboard/burndown"),
          fetch("/api/dashboard/deadlines"),
        ]);

        if (!statsRes.ok || !activitiesRes.ok || !distributionRes.ok || !burndownRes.ok || !deadlinesRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const [statsData, activitiesData, distributionData, burndownDataRes, deadlinesData] = await Promise.all([
          statsRes.json(),
          activitiesRes.json(),
          distributionRes.json(),
          burndownRes.json(),
          deadlinesRes.json(),
        ]);

        setStats(statsData);
        setActivities(activitiesData.map((a: any) => ({
          ...a,
          createdAt: new Date(a.createdAt),
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
    };

    fetchDashboardData();
  }, []);

  return {
    stats,
    activities,
    distribution,
    burndownData,
    deadlines,
    loading,
    error,
  };
}
