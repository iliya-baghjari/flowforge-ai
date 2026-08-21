import { TaskManager } from "@/components/task/task-manager";

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        <p className="mt-2 text-muted-foreground">
          Create, update, and manage project tasks with priorities, status, and due dates.
        </p>
      </div>

      <TaskManager />
    </div>
  );
}
