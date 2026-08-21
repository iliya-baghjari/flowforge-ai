import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { addDays } from "date-fns";

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

    // Get tasks with deadlines (upcoming 30 days)
    const today = new Date();
    const thirtyDaysFromNow = addDays(today, 30);

    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        dueDate: {
          gte: today,
          lte: thirtyDaysFromNow,
        },
        status: { not: "completed" },
      },
      orderBy: { dueDate: "asc" },
      select: {
        id: true,
        title: true,
        dueDate: true,
        status: true,
      },
    });

    // Group by date
    const deadlines = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      date: task.dueDate || new Date(),
      status: task.status,
    }));

    return NextResponse.json(deadlines);
  } catch (error) {
    console.error("Deadlines fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch deadlines" },
      { status: 500 }
    );
  }
}
