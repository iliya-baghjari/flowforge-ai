"use client";

import * as React from "react";
import { Calendar, Check, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/store/workspace-store";

interface TaskProject {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
}

interface TaskRecord {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "in_review" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: string | null;
  projectId: string;
  project: TaskProject;
  updatedAt: string;
}

const initialDraft = {
  title: "",
  description: "",
  status: "todo" as TaskRecord["status"],
  priority: "medium" as TaskRecord["priority"],
  dueDate: "",
  projectId: "",
};

const taskStatusOptions = [
  { value: "todo", label: "Todo" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "completed", label: "Completed" },
] as const;

const taskPriorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
] as const;

const statusClasses: Record<TaskRecord["status"], string> = {
  todo: "bg-slate-500/10 text-slate-600",
  in_progress: "bg-blue-500/10 text-blue-600",
  in_review: "bg-amber-500/10 text-amber-600",
  completed: "bg-emerald-500/10 text-emerald-600",
};

const priorityClasses: Record<TaskRecord["priority"], string> = {
  low: "bg-emerald-500/10 text-emerald-600",
  medium: "bg-sky-500/10 text-sky-600",
  high: "bg-orange-500/10 text-orange-600",
  urgent: "bg-rose-500/10 text-rose-600",
};

export function TaskManager() {
  const { currentWorkspaceId } = useWorkspaceStore();
  const [tasks, setTasks] = React.useState<TaskRecord[]>([]);
  const [projects, setProjects] = React.useState<TaskProject[]>([]);
  const [draft, setDraft] = React.useState(initialDraft);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadProjects = React.useCallback(async () => {
    if (!currentWorkspaceId) {
      setProjects([]);
      return;
    }

    try {
      const response = await fetch(`/api/projects?workspaceId=${currentWorkspaceId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Failed to load projects");
      setProjects(Array.isArray(data.projects) ? data.projects : []);
    } catch (err) {
      console.error(err);
    }
  }, [currentWorkspaceId]);

  const loadTasks = React.useCallback(async () => {
    if (!currentWorkspaceId) {
      setTasks([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tasks?workspaceId=${currentWorkspaceId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Failed to load tasks");
      setTasks(Array.isArray(data.tasks) ? data.tasks : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [currentWorkspaceId]);

  React.useEffect(() => {
    loadProjects();
    loadTasks();
  }, [loadProjects, loadTasks]);

  React.useEffect(() => {
    if (!projects.length) {
      setDraft((current) => ({ ...current, projectId: "" }));
      return;
    }

    const selectedProject = projects.find((project) => project.id === draft.projectId);
    if (!selectedProject && !editingId) {
      setDraft((current) => ({ ...current, projectId: projects[0].id }));
    }
  }, [projects, draft.projectId, editingId]);

  const resetForm = () => {
    setDraft(initialDraft);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!currentWorkspaceId) {
      setError("Select a workspace before creating a task.");
      return;
    }

    if (!draft.projectId) {
      setError("Select a project before saving the task.");
      return;
    }

    const cleanTitle = draft.title.trim();
    if (!cleanTitle) {
      setError("Task title is required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        workspaceId: currentWorkspaceId,
        projectId: draft.projectId,
        title: cleanTitle,
        description: draft.description.trim() || null,
        status: draft.status,
        priority: draft.priority,
        dueDate: draft.dueDate || null,
      };

      const response = editingId
        ? await fetch(`/api/tasks/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to save task");
      }

      resetForm();
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task: TaskRecord) => {
    setEditingId(task.id);
    setDraft({
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "",
      projectId: task.projectId,
    });
  };

  const handleDelete = async (taskId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to delete task");
      }
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  if (!currentWorkspaceId) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-6 text-sm text-muted-foreground shadow-sm">
        Select a workspace to manage tasks.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {editingId ? "Edit task" : "Create task"}
              </p>
              <p className="text-xs text-muted-foreground">Keep work moving and deadlines visible.</p>
            </div>
          </div>
          {editingId && (
            <Button variant="outline" size="sm" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>

        {error && <p className="mb-4 rounded-md border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-600">{error}</p>}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-foreground">Title</label>
            <input
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-0 focus:border-primary"
              placeholder="Ship onboarding flow"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-foreground">Description</label>
            <textarea
              value={draft.description}
              onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
              className="min-h-25 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="Summarize the goal, blockers, and acceptance criteria..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Project</label>
            <select
              value={draft.projectId}
              onChange={(event) => setDraft((current) => ({ ...current, projectId: event.target.value }))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Status</label>
            <select
              value={draft.status}
              onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as TaskRecord["status"] }))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {taskStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Priority</label>
            <select
              value={draft.priority}
              onChange={(event) => setDraft((current) => ({ ...current, priority: event.target.value as TaskRecord["priority"] }))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {taskPriorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Due date</label>
            <input
              type="date"
              value={draft.dueDate}
              onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value }))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : editingId ? "Update task" : "Create task"}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-foreground">Task list</p>
            <p className="text-sm text-muted-foreground">Manage task status, dates, and priorities.</p>
          </div>
        </div>

        {loading && !tasks.length ? (
          <p className="text-sm text-muted-foreground">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-background/50 p-6 text-center text-sm text-muted-foreground">
            No tasks yet for this workspace.
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="rounded-xl border border-border/60 bg-background/40 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-foreground">{task.title}</p>
                      <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${statusClasses[task.status]}`}>
                        {taskStatusOptions.find((option) => option.value === task.status)?.label}
                      </span>
                      <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${priorityClasses[task.priority]}`}>
                        {taskPriorityOptions.find((option) => option.value === task.priority)?.label}
                      </span>
                    </div>

                    {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <span
                          className="inline-flex h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: task.project?.color ?? "#6366f1" }}
                        />
                        {task.project?.name ?? "Project"}
                      </span>

                      {task.dueDate && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(task)}>
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(task.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
