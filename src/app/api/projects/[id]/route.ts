import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessWorkspace } from "@/lib/workspace-permissions";
import { NextResponse } from "next/server";

async function getProjectMembership(userEmail: string, workspaceId: string) {
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

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const membership = await getProjectMembership(session.user.email, project.workspaceId);
    if (!membership || !canAccessWorkspace(membership.role as any, "workspace:update")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : undefined;
    const description = typeof body?.description === "string" ? body.description.trim() || null : undefined;
    const status = typeof body?.status === "string" ? body.status : undefined;
    const archived = typeof body?.archived === "boolean" ? body.archived : undefined;
    const favorite = typeof body?.favorite === "boolean" ? body.favorite : undefined;
    const color = typeof body?.color === "string" ? body.color.trim() || "#6366f1" : undefined;
    const icon = typeof body?.icon === "string" ? body.icon.trim() || "📁" : undefined;

    if (
      typeof name === "undefined" &&
      typeof description === "undefined" &&
      typeof status === "undefined" &&
      typeof archived === "undefined" &&
      typeof favorite === "undefined" &&
      typeof color === "undefined" &&
      typeof icon === "undefined"
    ) {
      return NextResponse.json({ error: "No updates supplied" }, { status: 400 });
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(typeof name !== "undefined" ? { name } : {}),
        ...(typeof description !== "undefined" ? { description } : {}),
        ...(typeof status !== "undefined" ? { status } : {}),
        ...(typeof archived !== "undefined" ? { archived } : {}),
        ...(typeof favorite !== "undefined" ? { favorite } : {}),
        ...(typeof color !== "undefined" ? { color } : {}),
        ...(typeof icon !== "undefined" ? { icon } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Project update error:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
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

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const membership = await getProjectMembership(session.user.email, project.workspaceId);
    if (!membership || !canAccessWorkspace(membership.role as any, "workspace:update")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Project delete error:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
