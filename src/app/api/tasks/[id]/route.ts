import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessWorkspace } from "@/lib/workspace-permissions";
import { NextResponse } from "next/server";

function normalizeTaskStatus(value: unknown) {
  return typeof value === "string" && ["backlog", "todo", "in_progress", "in_review", "completed"].includes(value)
    ? value
    : null;
}

function normalizeTaskPriority(value: unknown) {
  return typeof value === "string" && ["low", "medium", "high", "urgent"].includes(value)
    ? value
    : null;
}

async function getTaskMembership(userEmail: string, workspaceId: string) {
  const currentUser = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!currentUser) {
    return null;
  }

  return prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId: currentUser.id,
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const membership = await getTaskMembership(session.user.email, task.project.workspaceId);
    if (!membership || !canAccessWorkspace(membership.role as any, "workspace:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Task detail fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const membership = await getTaskMembership(session.user.email, task.project.workspaceId);
    if (!membership || !canAccessWorkspace(membership.role as any, "workspace:update")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const title = typeof body?.title === "string" ? body.title.trim() : undefined;
    const description = typeof body?.description === "string" ? body.description.trim() || null : undefined;
    const label = typeof body?.label === "string" ? body.label.trim() || null : undefined;
    const status = normalizeTaskStatus(body?.status);
    const priority = normalizeTaskPriority(body?.priority);
    const dueDate = typeof body?.dueDate === "string" || body?.dueDate === null ? body.dueDate : undefined;
    const projectId = typeof body?.projectId === "string" ? body.projectId : undefined;

    if (typeof projectId !== "undefined" && projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          workspaceId: task.project.workspaceId,
        },
      });

      if (!project) {
        return NextResponse.json({ error: "Project not found in this workspace" }, { status: 404 });
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(typeof title !== "undefined" ? { title } : {}),
        ...(typeof description !== "undefined" ? { description } : {}),
        ...(typeof label !== "undefined" ? { label } : {}),
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
        ...(typeof dueDate !== "undefined" ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
        ...(typeof projectId !== "undefined" ? { projectId: projectId || task.projectId } : {}),
      },
      include: {
        project: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    await prisma.activityLog.create({
      data: {
        type: "task_status_changed",
        title: `Updated task: ${updatedTask.title}`,
        description: `Status changed to ${updatedTask.status}`,
        taskId: updatedTask.id,
        projectId: updatedTask.projectId,
        userId: task.userId,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Task update error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const membership = await getTaskMembership(session.user.email, task.project.workspaceId);
    if (!membership || !canAccessWorkspace(membership.role as any, "workspace:update")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Task delete error:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
