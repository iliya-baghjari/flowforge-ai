import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, FolderKanban, ListTodo } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.email) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    notFound();
  }

  const task = await prisma.task.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      project: true,
    },
  });

  if (!task) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Task details
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">{task.title}</h1>
          </div>
          <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {task.status}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border/60 bg-background/40 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ListTodo className="h-4 w-4" />
              Status
            </div>
            <p className="mt-2 font-medium text-foreground">{task.status}</p>
          </div>

          <div className="rounded-xl border border-border/60 bg-background/40 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FolderKanban className="h-4 w-4" />
              Project
            </div>
            <p className="mt-2 font-medium text-foreground">{task.project?.name ?? "Unassigned"}</p>
          </div>

          <div className="rounded-xl border border-border/60 bg-background/40 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Due date
            </div>
            <p className="mt-2 font-medium text-foreground">
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
            </p>
          </div>
        </div>

        {task.description && (
          <div className="mt-6 rounded-xl border border-border/60 bg-background/40 p-4">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Description
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground">
              {task.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
