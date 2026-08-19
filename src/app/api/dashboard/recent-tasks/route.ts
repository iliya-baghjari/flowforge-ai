import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
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
      include: {
        task: {
          include: {
            project: true,
          },
        },
      },
    });

    const seenTaskIds = new Set<string>();
    const recentTasks: Array<{
      id: string;
      title: string;
      status: string;
      projectName?: string;
      lastUpdated: Date;
    }> = [];

    for (const entry of recentActivity) {
      const task = entry.task;
      if (!task || !entry.taskId || seenTaskIds.has(entry.taskId)) {
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
