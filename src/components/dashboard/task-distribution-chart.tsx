"use client";

import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TaskDistributionChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

const COLORS = {
  todo: "#3b82f6",
  in_progress: "#f59e0b",
  in_review: "#8b5cf6",
  completed: "#10b981",
};

export function TaskDistributionChart({ data }: TaskDistributionChartProps) {
  const getColor = (name: string) => {
    const statusMap: Record<string, string> = {
      Todo: COLORS.todo,
      "In Progress": COLORS.in_progress,
      "In Review": COLORS.in_review,
      Completed: COLORS.completed,
    };
    return statusMap[name] || "#6b7280";
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        Task Distribution by Status
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "0.5rem",
              color: "var(--color-foreground)",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
