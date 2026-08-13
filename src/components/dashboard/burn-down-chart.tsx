"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface BurnDownChartProps {
  data: Array<{
    day: string;
    remaining: number;
    completed: number;
  }>;
}

export function BurnDownChart({ data }: BurnDownChartProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        Sprint Burn-down Chart
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="day"
            stroke="var(--color-muted-foreground)"
            style={{ fontSize: "0.875rem" }}
          />
          <YAxis
            stroke="var(--color-muted-foreground)"
            style={{ fontSize: "0.875rem" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "0.5rem",
              color: "var(--color-foreground)",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="remaining"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ fill: "#ef4444", r: 4 }}
            activeDot={{ r: 6 }}
            name="Tasks Remaining"
          />
          <Line
            type="monotone"
            dataKey="completed"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ fill: "#22c55e", r: 4 }}
            activeDot={{ r: 6 }}
            name="Tasks Completed"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
