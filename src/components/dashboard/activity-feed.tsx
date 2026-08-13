"use client";

import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  MessageCircle,
  Plus,
  Repeat2,
  UserPlus,
} from "lucide-react";

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

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task_created":
        return <Plus className="h-4 w-4 text-blue-500" />;
      case "task_completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "task_status_changed":
        return <Repeat2 className="h-4 w-4 text-purple-500" />;
      case "comment_added":
        return <MessageCircle className="h-4 w-4 text-orange-500" />;
      case "project_created":
        return <UserPlus className="h-4 w-4 text-blue-600" />;
      default:
        return <Plus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case "task_created":
        return "Created task";
      case "task_completed":
        return "Completed task";
      case "task_status_changed":
        return "Changed task status";
      case "comment_added":
        return "Added comment";
      case "project_created":
        return "Created project";
      default:
        return "Activity";
    }
  };

  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">No recent activities</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
      <div className="rounded-xl border border-border/60 bg-card p-6">
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={activity.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="rounded-full border border-border/60 bg-background p-2">
                  {getActivityIcon(activity.type)}
                </div>
                {index < activities.length - 1 && (
                  <div className="mt-2 h-8 w-0.5 bg-border/40" />
                )}
              </div>
              <div className="flex-1 pt-1 pb-4">
                <p className="font-medium text-foreground">
                  {getActivityLabel(activity.type)}
                </p>
                {activity.title && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {activity.title}
                  </p>
                )}
                {activity.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
