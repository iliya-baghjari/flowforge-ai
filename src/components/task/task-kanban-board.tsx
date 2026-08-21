"use client";

import * as React from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { CalendarDays, GripVertical } from "lucide-react";

export type TaskStatus = "backlog" | "todo" | "in_progress" | "in_review" | "completed";

export interface KanbanTask {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: string | null;
  projectId: string;
  project: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
  };
  updatedAt: string;
}

const KANBAN_COLUMNS: ReadonlyArray<{
  id: TaskStatus;
  title: string;
  accent: string;
}> = [
  { id: "backlog", title: "Backlog", accent: "bg-slate-500/10 text-slate-600" },
  { id: "todo", title: "Todo", accent: "bg-cyan-500/10 text-cyan-600" },
  { id: "in_progress", title: "In Progress", accent: "bg-blue-500/10 text-blue-600" },
  { id: "in_review", title: "In Review", accent: "bg-amber-500/10 text-amber-600" },
  { id: "completed", title: "Completed", accent: "bg-emerald-500/10 text-emerald-600" },
] as const;

const priorityClasses: Record<KanbanTask["priority"], string> = {
  low: "bg-emerald-500/10 text-emerald-600",
  medium: "bg-sky-500/10 text-sky-600",
  high: "bg-orange-500/10 text-orange-600",
  urgent: "bg-rose-500/10 text-rose-600",
};

interface TaskKanbanBoardProps {
  tasks: KanbanTask[];
  onTaskStatusChange: (taskId: string, status: TaskStatus) => Promise<void> | void;
}

function TaskCard({ task }: { task: KanbanTask }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task", status: task.status },
    transition: { duration: 200, easing: "cubic-bezier(0.25, 0.1, 0.25, 1)" },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.article
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={[
        "rounded-xl border border-border/70 bg-card p-3 shadow-sm ring-1 ring-transparent transition-all",
        isDragging ? "cursor-grabbing opacity-60 shadow-lg ring-primary/20" : "cursor-default",
      ].join(" ")}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            aria-label={`Drag ${task.title}`}
            className="mt-0.5 rounded-md border border-border/60 bg-background p-1 text-muted-foreground transition hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{task.title}</p>
          </div>
        </div>
        <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${priorityClasses[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="line-clamp-3 text-xs leading-5 text-muted-foreground">{task.description}</p>
      )}

      <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: task.project?.color ?? "#6366f1" }}
          />
          {task.project?.name ?? "Project"}
        </span>

        {task.dueDate && (
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </motion.article>
  );
}

function TaskColumn({
  column,
  tasks,
}: {
  column: (typeof KANBAN_COLUMNS)[number];
  tasks: KanbanTask[];
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", status: column.id },
  });

  return (
    <div
      ref={setNodeRef}
      className={[
        "flex min-h-112 w-full min-w-65 flex-col rounded-2xl border border-border/60 bg-background/40 p-3 shadow-sm",
        isOver ? "border-primary/40 bg-primary/5" : "",
      ].join(" ")}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${column.accent}`}>
            {tasks.length}
          </span>
          <h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
        </div>
      </div>

      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="flex min-h-45 items-center justify-center rounded-xl border border-dashed border-border/60 bg-background/30 px-3 text-center text-xs text-muted-foreground">
              Drop a task here
            </div>
          ) : (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function TaskKanbanBoard({ tasks, onTaskStatusChange }: TaskKanbanBoardProps) {
  const [activeTaskId, setActiveTaskId] = React.useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const columns = React.useMemo(
    () =>
      KANBAN_COLUMNS.map((column) => ({
        ...column,
        tasks: tasks.filter((task) => task.status === column.id),
      })),
    [tasks],
  );

  const activeTask = React.useMemo(
    () => tasks.find((task) => task.id === activeTaskId) ?? null,
    [activeTaskId, tasks],
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTaskId(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const taskToMove = tasks.find((task) => task.id === activeId);
    if (!taskToMove) return;

    const nextStatus =
      columns.find((column) => column.id === overId)?.id ??
      tasks.find((task) => task.id === overId)?.status ??
      null;

    if (!nextStatus || nextStatus === taskToMove.status) return;

    await onTaskStatusChange(activeId, nextStatus as TaskStatus);
  };

  const handleDragCancel = () => {
    setActiveTaskId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid gap-4 xl:grid-cols-5">
        {columns.map((column) => (
          <TaskColumn key={column.id} column={column} tasks={column.tasks} />
        ))}
      </div>

      {activeTask && (
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          className="pointer-events-none fixed left-[-9999px] top-[-9999px] w-65"
        >
          <TaskCard task={activeTask} />
        </motion.div>
      )}
    </DndContext>
  );
}
