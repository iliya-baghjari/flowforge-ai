import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { subDays, format } from "date-fns";

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

    // Get data for the last 14 days
    const today = new Date();
    const fourteenDaysAgo = subDays(today, 14);

    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: fourteenDaysAgo },
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate data for each day
    const chartData = [];
    for (let i = 13; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, "MMM dd");

      // Count tasks created by this date
      const totalTasks = tasks.filter(
        (t) => new Date(t.createdAt) <= date
      ).length;

      // Count completed tasks by this date
      const completedTasks = tasks.filter(
        (t) =>
          t.status === "completed" &&
          new Date(t.updatedAt) <= date
      ).length;

      const remaining = Math.max(0, totalTasks - completedTasks);

      chartData.push({
        day: dateStr,
        remaining,
        completed: completedTasks,
      });
    }

    return NextResponse.json(chartData);
  } catch (error) {
    console.error("Burn-down chart error:", error);
    return NextResponse.json(
      { error: "Failed to fetch burn-down data" },
      { status: 500 }
    );
  }
}
