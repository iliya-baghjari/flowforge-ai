"use client";

import * as React from "react";
import { CheckCircle2, Clock, ListTodo, Zap } from "lucide-react";

interface SummaryCardsProps {
  totalTasks: number;
  completedTasks: number;
  upcomingDeadlines: number;
  activeProjects: number;
}

export const SummaryCards = React.memo(function SummaryCards({
  totalTasks,
  completedTasks,
  upcomingDeadlines,
  activeProjects,
}: SummaryCardsProps) {
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const cards = React.useMemo(
    () => [
      {
        title: "Total Tasks",
        value: totalTasks,
        icon: ListTodo,
        color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        bgColor: "border-blue-200 dark:border-blue-800",
      },
      {
        title: "Completed",
        value: completedTasks,
        subtitle: `${completionRate}% completion`,
        icon: CheckCircle2,
        color: "bg-green-500/10 text-green-600 dark:text-green-400",
        bgColor: "border-green-200 dark:border-green-800",
      },
      {
        title: "Upcoming Deadlines",
        value: upcomingDeadlines,
        subtitle: "Next 7 days",
        icon: Clock,
        color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
        bgColor: "border-orange-200 dark:border-orange-800",
      },
      {
        title: "Active Projects",
        value: activeProjects,
        icon: Zap,
        color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
        bgColor: "border-purple-200 dark:border-purple-800",
      },
    ],
    [activeProjects, completionRate, completedTasks, totalTasks, upcomingDeadlines],
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`rounded-xl border ${card.bgColor} bg-card p-6 shadow-sm transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {card.value}
                </p>
                {card.subtitle && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {card.subtitle}
                  </p>
                )}
              </div>
              <div className={`${card.color} rounded-lg p-3`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});
