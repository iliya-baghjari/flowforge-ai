import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database is not configured. Add DATABASE_URL to your environment." },
        { status: 503 }
      );
    }

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const recentActivity = await prisma.activityLog.findMany({
      where: {
        userId: user.id,
        taskId: { not: null },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        taskId: true,
        title: true,
        createdAt: true,
      },
    });

    const taskIds = [...new Set(
      recentActivity
        .map((entry) => entry.taskId)
        .filter((taskId): taskId is string => Boolean(taskId))
    )];

    const tasks = taskIds.length
      ? await prisma.task.findMany({
          where: {
            id: { in: taskIds },
            userId: user.id,
          },
          include: {
            project: true,
          },
        })
      : [];

    const taskMap = new Map(tasks.map((task) => [task.id, task]));
    const seenTaskIds = new Set<string>();
    const recentTasks: Array<{
      id: string;
      title: string;
      status: string;
      projectName?: string;
      lastUpdated: Date;
    }> = [];

    for (const entry of recentActivity) {
      if (!entry.taskId || seenTaskIds.has(entry.taskId)) {
        continue;
      }

      const task = taskMap.get(entry.taskId);
      if (!task) {
        continue;
      }

      seenTaskIds.add(entry.taskId);
      recentTasks.push({
        id: task.id,
        title: task.title || entry.title,
        status: task.status,
        projectName: task.project?.name ?? undefined,
        lastUpdated: entry.createdAt,
      });

      if (recentTasks.length >= 5) {
        break;
      }
    }

    return NextResponse.json(recentTasks);
  } catch (error) {
    console.error("Recent tasks fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent tasks" },
      { status: 500 }
    );
  }
}
