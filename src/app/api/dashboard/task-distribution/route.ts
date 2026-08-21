import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface DistributionItem {
  name: string;
  value: number;
}

export async function GET(): Promise<NextResponse> {
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

      // Safeguard: check if `prisma.task` exists (in case the model is missing)
    if (!prisma.task) {
      console.error("Task model is not available in Prisma client.");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }
    // Get task distribution by status
     const todoCount: number = await prisma.task.count({
      where: { userId: user.id, status: "todo" },
    });
    const inProgressCount: number = await prisma.task.count({
      where: { userId: user.id, status: "in_progress" },
    });
    const inReviewCount: number = await prisma.task.count({
      where: { userId: user.id, status: "in_review" },
    });
    const completedCount: number = await prisma.task.count({
      where: { userId: user.id, status: "completed" },
    });

    const distribution = [
      { name: "Todo", value: todoCount },
      { name: "In Progress", value: inProgressCount },
      { name: "In Review", value: inReviewCount },
      { name: "Completed", value: completedCount },
    ].filter((item) => item.value > 0);

    return NextResponse.json(distribution);
  } catch (error) {
    console.error("Task distribution error:", error);
    return NextResponse.json(
      { error: "Failed to fetch task distribution" },
      { status: 500 }
    );
  }
}
