"use client";

import * as React from "react";
import { Calendar, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AIAssistantPanel } from "@/components/ai/ai-assistant-panel";
import { TaskKanbanBoard, type KanbanTask, type TaskStatus } from "@/components/task/task-kanban-board";
import { useWorkspaceStore } from "@/store/workspace-store";

interface TaskProject {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
}

interface TaskRecord extends KanbanTask {
  userId: string;
  label: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
}

interface WorkspaceMember {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
}

interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  author: string;
  message: string;
  createdAt: string;
}

interface PresenceEntry {
  userId: string;
  name: string | null;
  email: string | null;
  image: string | null;
  lastSeen: number;
}

const PAGE_SIZE = 6;

function getWorkspaceStorageKey(workspaceId: string, suffix: string) {
  return `flowforge:${workspaceId}:${suffix}`;
}

function publishRealtimeEvent(workspaceId: string | null, channel: string, payload: Record<string, unknown>) {
  if (!workspaceId || typeof window === "undefined") return;

  const channelName = `flowforge:${channel}:${workspaceId}`;

  if ("BroadcastChannel" in window) {
    const broadcast = new BroadcastChannel(channelName);
    broadcast.postMessage(payload);
    broadcast.close();
  }

  window.dispatchEvent(new CustomEvent(channelName, { detail: payload }));
}

function extractEventData<T>(event: MessageEvent | Event): T | null {
  if (event instanceof MessageEvent) {
    return (event.data ?? null) as T | null;
  }

  if ("detail" in event) {
    return (event.detail as T | null) ?? null;
  }

  return null;
}

function useDebouncedValue<T>(value: T, delay = 250) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
}

const initialDraft = {
  title: "",
  description: "",
  label: "",
  status: "todo" as TaskRecord["status"],
  priority: "medium" as TaskRecord["priority"],
  dueDate: "",
  projectId: "",
};

const taskStatusOptions = [
  { value: "backlog", label: "Backlog" },
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
  backlog: "bg-slate-500/10 text-slate-600",
  todo: "bg-cyan-500/10 text-cyan-600",
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
  const [members, setMembers] = React.useState<WorkspaceMember[]>([]);
  const [draft, setDraft] = React.useState(initialDraft);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | TaskRecord["status"]>("all");
  const [priorityFilter, setPriorityFilter] = React.useState<"all" | TaskRecord["priority"]>("all");
  const [assigneeFilter, setAssigneeFilter] = React.useState<"all" | string>("all");
  const [labelFilter, setLabelFilter] = React.useState("all");
  const [dueDateFrom, setDueDateFrom] = React.useState("");
  const [dueDateTo, setDueDateTo] = React.useState("");
  const [sortBy, setSortBy] = React.useState<"created_at" | "due_date" | "priority" | "alphabetical">("created_at");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("desc");
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [commentsByTask, setCommentsByTask] = React.useState<Record<string, TaskComment[]>>({});
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
  const [commentDraft, setCommentDraft] = React.useState("");
  const [presence, setPresence] = React.useState<PresenceEntry[]>([]);
  const searchValue = useDebouncedValue(searchQuery, 250);
  const loadMoreRef = React.useRef<HTMLDivElement | null>(null);
  const paletteInputRef = React.useRef<HTMLInputElement | null>(null);
  const currentUserId = React.useMemo(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("flowforge-user-id");
  }, [currentWorkspaceId]);

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

  const loadMembers = React.useCallback(async () => {
    if (!currentWorkspaceId) {
      setMembers([]);
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${currentWorkspaceId}/members`);
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Failed to load members");
      setMembers(Array.isArray(data) ? data : []);
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
    loadMembers();
  }, [loadProjects, loadTasks, loadMembers]);

  React.useEffect(() => {
    if (!currentWorkspaceId) {
      setCommentsByTask({});
      return;
    }

    const storageKey = getWorkspaceStorageKey(currentWorkspaceId, "comments");
    const saved = window.localStorage.getItem(storageKey);
    setCommentsByTask(saved ? JSON.parse(saved) : {});
  }, [currentWorkspaceId]);

  React.useEffect(() => {
    if (!currentWorkspaceId) return;

    const channelName = `flowforge:comments:${currentWorkspaceId}`;
    const channel = "BroadcastChannel" in window ? new BroadcastChannel(channelName) : null;

    const handleIncomingMessage = (event: MessageEvent | Event) => {
      const message = extractEventData<{ type?: string; data?: Record<string, TaskComment[]> }>(event);
      if (!message || message.type !== "comments") return;

      setCommentsByTask((current) => ({
        ...current,
        ...((message.data ?? {}) as Record<string, TaskComment[]>),
      }));
    };

    window.addEventListener(channelName, handleIncomingMessage as EventListener);
    if (channel) {
      channel.onmessage = (event) => handleIncomingMessage(event);
    }

    return () => {
      window.removeEventListener(channelName, handleIncomingMessage as EventListener);
      channel?.close();
    };
  }, [currentWorkspaceId]);

  React.useEffect(() => {
    if (!currentWorkspaceId) return;

    const storageKey = getWorkspaceStorageKey(currentWorkspaceId, "comments");
    window.localStorage.setItem(storageKey, JSON.stringify(commentsByTask));
  }, [commentsByTask, currentWorkspaceId]);

  React.useEffect(() => {
    if (!currentWorkspaceId) return;

    const refreshTasks = () => {
      void loadTasks();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) refreshTasks();
    };

    const timer = window.setInterval(refreshTasks, 30000);
    window.addEventListener("focus", refreshTasks);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshTasks);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [currentWorkspaceId, loadTasks]);

  React.useEffect(() => {
    if (!currentWorkspaceId || !members.length) return;

    const storageKey = getWorkspaceStorageKey(currentWorkspaceId, "presence");
    const loadPresence = () => {
      const stored = window.localStorage.getItem(storageKey);
      const parsed: PresenceEntry[] = stored ? JSON.parse(stored) : [];
      const now = Date.now();
      const active = parsed.filter((entry) => now - entry.lastSeen < 30000);
      setPresence(active);
    };

    const channelName = `flowforge:presence:${currentWorkspaceId}`;
    const channel = "BroadcastChannel" in window ? new BroadcastChannel(channelName) : null;
    const handlePresenceChange = (event: MessageEvent | Event) => {
      const message = extractEventData<{ userId?: string; name?: string | null; email?: string | null; image?: string | null; lastSeen?: number }>(event);
      if (!message?.userId) return;

      const updated = [...(JSON.parse(window.localStorage.getItem(storageKey) ?? "[]") as PresenceEntry[])].filter((entry) => entry.userId !== message.userId);
      updated.push({
        userId: message.userId,
        name: message.name ?? null,
        email: message.email ?? null,
        image: message.image ?? null,
        lastSeen: message.lastSeen ?? Date.now(),
      });
      window.localStorage.setItem(storageKey, JSON.stringify(updated));
      loadPresence();
    };

    loadPresence();
    window.addEventListener(channelName, handlePresenceChange as EventListener);
    if (channel) {
      channel.onmessage = (event) => handlePresenceChange(event);
    }

    return () => {
      window.removeEventListener(channelName, handlePresenceChange as EventListener);
      channel?.close();
    };
  }, [currentWorkspaceId, members.length]);

  React.useEffect(() => {
    if (!currentWorkspaceId) return;

    const sessionUser = members.find((member) => member.userId === currentUserId);
    const myUser = sessionUser?.user ?? null;
    const cacheKey = getWorkspaceStorageKey(currentWorkspaceId, "presence");
    const heartbeat = () => {
      const payload = {
        userId: currentUserId ?? "anonymous",
        name: myUser?.name ?? "You",
        email: myUser?.email ?? null,
        image: myUser?.image ?? null,
        lastSeen: Date.now(),
      };

      window.localStorage.setItem(cacheKey, JSON.stringify([
        ...JSON.parse(window.localStorage.getItem(cacheKey) ?? "[]").filter((entry: PresenceEntry) => entry.userId !== payload.userId),
        payload,
      ]));

      publishRealtimeEvent(currentWorkspaceId, "presence", payload);
    };

    heartbeat();

    const timer = window.setInterval(heartbeat, 15000);
    window.addEventListener("focus", heartbeat);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) heartbeat();
    });

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", heartbeat);
      document.removeEventListener("visibilitychange", () => {
        if (!document.hidden) heartbeat();
      });
    };
  }, [currentUserId, currentWorkspaceId, members]);

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

  React.useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchValue, statusFilter, priorityFilter, assigneeFilter, labelFilter, dueDateFrom, dueDateTo, sortBy, sortDirection, currentWorkspaceId]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }

      if (event.key === "Escape") {
        setPaletteOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  React.useEffect(() => {
    if (!paletteOpen) return;
    const frame = window.requestAnimationFrame(() => paletteInputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [paletteOpen]);

  const filteredTasks = React.useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    const filtered = tasks.filter((task) => {
      const matchesQuery =
        !query ||
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.project?.name.toLowerCase().includes(query) ||
        task.user?.name?.toLowerCase().includes(query) ||
        task.user?.email?.toLowerCase().includes(query);

      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === "all" || task.userId === assigneeFilter;
      const matchesLabel = labelFilter === "all" || task.label?.toLowerCase() === labelFilter.toLowerCase();

      const taskDueDate = task.dueDate ? new Date(task.dueDate).getTime() : null;
      const matchesDueFrom = !dueDateFrom || (taskDueDate !== null && taskDueDate >= new Date(`${dueDateFrom}T00:00:00`).getTime());
      const matchesDueTo = !dueDateTo || (taskDueDate !== null && taskDueDate <= new Date(`${dueDateTo}T23:59:59`).getTime());

      return matchesQuery && matchesStatus && matchesPriority && matchesAssignee && matchesLabel && matchesDueFrom && matchesDueTo;
    });

    filtered.sort((left, right) => {
      const direction = sortDirection === "asc" ? 1 : -1;

      if (sortBy === "priority") {
        const order = { urgent: 4, high: 3, medium: 2, low: 1 } as const;
        return (order[left.priority] - order[right.priority]) * direction;
      }

      if (sortBy === "alphabetical") {
        return left.title.localeCompare(right.title) * direction;
      }

      if (sortBy === "due_date") {
        const leftValue = left.dueDate ? new Date(left.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        const rightValue = right.dueDate ? new Date(right.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        return (leftValue - rightValue) * direction;
      }

      const leftValue = new Date(left.createdAt ?? 0).getTime();
      const rightValue = new Date(right.createdAt ?? 0).getTime();
      return (leftValue - rightValue) * direction;
    });

    return filtered;
  }, [assigneeFilter, dueDateFrom, dueDateTo, labelFilter, priorityFilter, searchValue, sortBy, sortDirection, statusFilter, tasks]);

  React.useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setVisibleCount((count) => Math.min(count + PAGE_SIZE, filteredTasks.length));
      },
      { rootMargin: "200px" },
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [filteredTasks.length]);

  const commandResults = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const entries = [
      ...tasks.map((task) => ({
        kind: "Task",
        label: task.title,
        value: task.title,
      })),
      ...projects.map((project) => ({
        kind: "Project",
        label: project.name,
        value: project.name,
      })),
      ...members.map((member) => ({
        kind: "Member",
        label: member.user?.name ?? member.user?.email ?? "Workspace member",
        value: member.user?.name ?? member.user?.email ?? "Workspace member",
      })),
    ];

    if (!query) return entries.slice(0, 8);

    return entries.filter((item) => item.value.toLowerCase().includes(query)).slice(0, 8);
  }, [members, projects, searchQuery, tasks]);

  const visibleTasks = filteredTasks.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTasks.length;
  const selectedTask = visibleTasks.find((task) => task.id === selectedTaskId) ?? visibleTasks[0] ?? null;
  const activeComments = selectedTask ? commentsByTask[selectedTask.id] ?? [] : [];

  React.useEffect(() => {
    if (!selectedTask && visibleTasks.length > 0) {
      setSelectedTaskId(visibleTasks[0].id);
      return;
    }

    if (selectedTask && !visibleTasks.some((task) => task.id === selectedTaskId)) {
      setSelectedTaskId(visibleTasks[0]?.id ?? null);
    }
  }, [selectedTask, selectedTaskId, visibleTasks]);

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setAssigneeFilter("all");
    setLabelFilter("all");
    setDueDateFrom("");
    setDueDateTo("");
    setSortBy("created_at");
    setSortDirection("desc");
  };

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
        label: draft.label.trim() || null,
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

      const nextAction = editingId ? "updated" : "created";
      publishRealtimeEvent(currentWorkspaceId, "notifications", {
        id: crypto.randomUUID(),
        type: "task",
        title: `Task ${nextAction}`,
        message: `${cleanTitle} was ${nextAction}.`,
        createdAt: new Date().toISOString(),
      });

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
      label: task.label ?? "",
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

      const deletedTask = tasks.find((task) => task.id === taskId);
      publishRealtimeEvent(currentWorkspaceId, "notifications", {
        id: crypto.randomUUID(),
        type: "task",
        title: "Task removed",
        message: deletedTask ? `${deletedTask.title} was deleted.` : "A task was removed.",
        createdAt: new Date().toISOString(),
      });

      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusChange = async (taskId: string, status: TaskStatus) => {
    const task = tasks.find((entry) => entry.id === taskId);
    if (!task || task.status === status) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to update task status");
      }

      setTasks((current) =>
        current.map((entry) =>
          entry.id === taskId
            ? {
                ...entry,
                status,
                updatedAt: data.updatedAt ?? new Date().toISOString(),
              }
            : entry,
        ),
      );

      publishRealtimeEvent(currentWorkspaceId, "notifications", {
        id: crypto.randomUUID(),
        type: "task",
        title: "Status updated",
        message: `${task.title} moved to ${status.replace("_", " ")}.`,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task status");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = () => {
    if (!selectedTask || !commentDraft.trim()) return;

    const newComment: TaskComment = {
      id: crypto.randomUUID(),
      taskId: selectedTask.id,
      userId: currentUserId ?? "local-user",
      author: members.find((member) => member.userId === currentUserId)?.user?.name ?? "You",
      message: commentDraft.trim(),
      createdAt: new Date().toISOString(),
    };

    setCommentsByTask((current) => {
      const next = {
        ...current,
        [selectedTask.id]: [...(current[selectedTask.id] ?? []), newComment],
      };

      publishRealtimeEvent(currentWorkspaceId, "comments", { type: "comments", data: next });
      return next;
    });

    setCommentDraft("");
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
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_380px]">
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

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background px-2 py-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Online
                  </span>
                  <div className="flex -space-x-2">
                    {presence.slice(0, 4).map((entry) => (
                      <div key={entry.userId} className="relative">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-linear-to-br from-primary to-violet-600 text-[10px] font-semibold text-white">
                          {(entry.name ?? entry.email ?? "U").charAt(0).toUpperCase()}
                        </div>
                        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500" />
                      </div>
                    ))}
                  </div>
                </div>
                {editingId && (
                  <Button variant="outline" size="sm" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
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
                <label className="mb-1 block text-sm font-medium text-foreground">Label</label>
                <input
                  value={draft.label}
                  onChange={(event) => setDraft((current) => ({ ...current, label: event.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="design, qa, launch"
                />
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
            <div className="mb-4 flex flex-col gap-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-foreground">Kanban board</p>
                  <p className="text-sm text-muted-foreground">Search, focus, and move work across the sprint.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPaletteOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold">⌘K</span>
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground"
                  >
                    Reset filters
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-xl border border-border bg-background/30 p-3">
                <div className="flex items-center gap-2">
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search tasks, projects, or members..."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-5">
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as "all" | TaskRecord["status"])}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="all">All statuses</option>
                    {taskStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={priorityFilter}
                    onChange={(event) => setPriorityFilter(event.target.value as "all" | TaskRecord["priority"])}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="all">All priorities</option>
                    {taskPriorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={assigneeFilter}
                    onChange={(event) => setAssigneeFilter(event.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="all">All assignees</option>
                    {members.map((member) => (
                      <option key={member.userId} value={member.userId}>
                        {member.user?.name ?? member.user?.email ?? "Member"}
                      </option>
                    ))}
                  </select>

                  <select
                    value={labelFilter}
                    onChange={(event) => setLabelFilter(event.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="all">All labels</option>
                    {Array.from(new Set(tasks.map((task) => task.label).filter(Boolean))).map((label) => (
                      <option key={label} value={label ?? "all"}>
                        {label}
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={dueDateFrom}
                      onChange={(event) => setDueDateFrom(event.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                      aria-label="Due date from"
                    />
                    <input
                      type="date"
                      value={dueDateTo}
                      onChange={(event) => setDueDateTo(event.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                      aria-label="Due date to"
                    />
                  </div>

                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as "created_at" | "due_date" | "priority" | "alphabetical")}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="created_at">Sort: created</option>
                    <option value="due_date">Sort: due date</option>
                    <option value="priority">Sort: priority</option>
                    <option value="alphabetical">Sort: A–Z</option>
                  </select>

                  <select
                    value={sortDirection}
                    onChange={(event) => setSortDirection(event.target.value as "asc" | "desc")}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-4 mt-2 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {filteredTasks.length} result{filteredTasks.length === 1 ? "" : "s"}
              </span>
              <span>
                Showing {visibleTasks.length} {visibleTasks.length === 1 ? "task" : "tasks"}
              </span>
            </div>

            {loading && !tasks.length ? (
              <p className="text-sm text-muted-foreground">Loading tasks...</p>
            ) : filteredTasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-background/50 p-6 text-center text-sm text-muted-foreground">
                No tasks match the current search and filters.
              </div>
            ) : (
              <>
                <TaskKanbanBoard tasks={visibleTasks} onTaskStatusChange={handleTaskStatusChange} />
                <div ref={loadMoreRef} className="mt-4 flex justify-center">
                  {hasMore ? (
                    <button
                      type="button"
                      onClick={() => setVisibleCount((count) => Math.min(count + PAGE_SIZE, filteredTasks.length))}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                    >
                      Load more
                    </button>
                  ) : (
                    <p className="text-sm text-muted-foreground">You’ve reached the end of the list.</p>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Live comments</p>
                <p className="text-xs text-muted-foreground">Instant team updates without page refresh.</p>
              </div>
              {selectedTask && (
                <span className="rounded-full border border-border/60 bg-background px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {selectedTask.title}
                </span>
              )}
            </div>

            {selectedTask ? (
              <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
                <div className="space-y-2">
                  {visibleTasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => setSelectedTaskId(task.id)}
                      className={[
                        "w-full rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                        selectedTask.id === task.id
                          ? "border-primary/40 bg-primary/5 text-foreground"
                          : "border-border/60 bg-background text-muted-foreground hover:bg-accent",
                      ].join(" ")}
                    >
                      {task.title}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="max-h-52 space-y-3 overflow-y-auto pr-1">
                    {(activeComments.length
                      ? activeComments
                      : [{ id: "empty", author: "System", message: "No comments yet. Start the conversation.", createdAt: new Date().toISOString() }]
                    ).map((comment) => (
                      <div key={comment.id} className="rounded-xl border border-border/60 bg-background/70 p-3">
                        <div className="mb-1 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                          <span className="font-semibold text-foreground">{comment.author}</span>
                          <span>{new Date(comment.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <p className="text-sm text-foreground">{comment.message}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      value={commentDraft}
                      onChange={(event) => setCommentDraft(event.target.value)}
                      placeholder="Add a quick update..."
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                    <Button size="sm" onClick={handleAddComment} disabled={!commentDraft.trim()}>
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Create or select a task to start live updates.</p>
            )}
          </div>

          {paletteOpen && (
            <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/40 px-4 py-16 backdrop-blur-sm">
              <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-3 shadow-2xl">
                <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold">⌘K</span>
                  <input
                    ref={paletteInputRef}
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search tasks, projects, or members"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>

                <div className="mt-3 space-y-2">
                  {commandResults.length ? (
                    commandResults.map((result, index) => (
                      <button
                        key={`${result.kind}-${result.label}-${index}`}
                        type="button"
                        onClick={() => {
                          setSearchQuery(result.value);
                          setPaletteOpen(false);
                        }}
                        className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-left text-sm hover:border-primary/50"
                      >
                        <span>
                          <span className="mr-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                            {result.kind}
                          </span>
                          {result.label}
                        </span>
                        <span className="text-xs text-muted-foreground">Open</span>
                      </button>
                    ))
                  ) : (
                    <p className="rounded-lg border border-dashed border-border bg-background/50 px-3 py-4 text-sm text-muted-foreground">
                      No results found.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <AIAssistantPanel workspaceId={currentWorkspaceId} tasks={tasks} projects={projects} members={members} />
      </div>
    </div>
  );
}
