import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessWorkspace } from "@/lib/workspace-permissions";
import { NextResponse } from "next/server";

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

    const projects = await prisma.project.findMany({
      where: { workspaceId },
      orderBy: [{ archived: "asc" }, { updatedAt: "desc" }],
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Project fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
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
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const description = typeof body?.description === "string" ? body.description.trim() : null;
    const status = typeof body?.status === "string" ? body.status : "active";
    const archived = Boolean(body?.archived);
    const favorite = Boolean(body?.favorite);
    const color = typeof body?.color === "string" && body.color.trim() ? body.color.trim() : "#6366f1";
    const icon = typeof body?.icon === "string" && body.icon.trim() ? body.icon.trim() : "📁";

    if (!workspaceId || !name) {
      return NextResponse.json({ error: "Workspace ID and project name are required" }, { status: 400 });
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

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        status,
        archived,
        favorite,
        color,
        icon,
        userId: currentUser.id,
        workspaceId,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Project create error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
