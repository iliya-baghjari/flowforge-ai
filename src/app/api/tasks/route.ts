import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessWorkspace } from "@/lib/workspace-permissions";
import { NextResponse } from "next/server";

function normalizeTaskStatus(value: unknown) {
  return typeof value === "string" && ["backlog", "todo", "in_progress", "in_review", "completed"].includes(value)
    ? value
    : "backlog";
}

function normalizeTaskPriority(value: unknown) {
  return typeof value === "string" && ["low", "medium", "high", "urgent"].includes(value)
    ? value
    : "medium";
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const membership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: currentUser.id,
      },
    });

    if (!membership || !canAccessWorkspace(membership.role as any, "workspace:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const tasks = await prisma.task.findMany({
      where: {
        project: {
          workspaceId,
        },
      },
      include: {
        project: true,
      },
      orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Task fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const workspaceId = typeof body?.workspaceId === "string" ? body.workspaceId : null;
    const projectId = typeof body?.projectId === "string" ? body.projectId : null;
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const description = typeof body?.description === "string" ? body.description.trim() : null;
    const status = normalizeTaskStatus(body?.status);
    const priority = normalizeTaskPriority(body?.priority);
    const dueDate = body?.dueDate ? new Date(body.dueDate) : null;

    if (!workspaceId || !projectId || !title) {
      return NextResponse.json(
        { error: "Workspace, project, and task title are required" },
        { status: 400 },
      );
    }

    const membership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: currentUser.id,
      },
    });

    if (!membership || !canAccessWorkspace(membership.role as any, "workspace:update")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        workspaceId,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found in this workspace" }, { status: 404 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        status,
        priority,
        dueDate: dueDate && !Number.isNaN(dueDate.getTime()) ? dueDate : null,
        projectId,
        userId: currentUser.id,
      },
      include: {
        project: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        type: "task_created",
        title: `Created task: ${task.title}`,
        description: task.description ?? undefined,
        taskId: task.id,
        projectId: task.projectId,
        userId: currentUser.id,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Task create error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
