import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { subDays } from "date-fns";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get total tasks
    const totalTasks = await prisma.task.count({
      where: { userId: user.id },
    });

    // Get completed tasks
    const completedTasks = await prisma.task.count({
      where: {
        userId: user.id,
        status: "completed",
      },
    });

    // Get upcoming deadlines (next 7 days)
    const today = new Date();
    const nextWeek = subDays(new Date(), -7);

    const upcomingDeadlines = await prisma.task.count({
      where: {
        userId: user.id,
        dueDate: {
          gte: today,
          lte: nextWeek,
        },
        status: { not: "completed" },
      },
    });

    // Get active projects
    const activeProjects = await prisma.project.count({
      where: {
        userId: user.id,
        status: "active",
        archived: false,
      },
    });

    return NextResponse.json({
      totalTasks,
      completedTasks,
      upcomingDeadlines,
      activeProjects,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
