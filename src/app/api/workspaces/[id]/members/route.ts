import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessWorkspace, WorkspaceRoles, WORKSPACE_ROLE_LABELS } from "@/lib/workspace-permissions";
import { NextResponse } from "next/server";

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

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const membership = await prisma.workspaceMember.findFirst({
      where: { workspaceId: id, userId: currentUser.id },
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      members.map((member) => ({
        id: member.id,
        userId: member.userId,
        role: member.role,
        roleLabel: WORKSPACE_ROLE_LABELS[member.role as keyof typeof WORKSPACE_ROLE_LABELS] ?? member.role,
        user: member.user,
      })),
    );
  } catch (error) {
    console.error("Workspace member fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
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

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentMembership = await prisma.workspaceMember.findFirst({
      where: { workspaceId: id, userId: currentUser.id },
    });

    if (!currentMembership || !canAccessWorkspace(currentMembership.role as any, "workspace:member:manage")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const memberId = typeof body?.memberId === "string" ? body.memberId : null;
    const role = typeof body?.role === "string" ? body.role : null;

    if (!memberId || !role) {
      return NextResponse.json({ error: "Member and role are required" }, { status: 400 });
    }

    if (![WorkspaceRoles.ADMIN, WorkspaceRoles.MEMBER, WorkspaceRoles.VIEWER].includes(role as any)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const targetMembership = await prisma.workspaceMember.findFirst({
      where: { id: memberId, workspaceId: id },
    });

    if (!targetMembership) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (targetMembership.userId === currentUser.id && role !== currentMembership.role) {
      return NextResponse.json({ error: "You cannot change your own role" }, { status: 400 });
    }

    const updated = await prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Workspace member update error:", error);
    return NextResponse.json({ error: "Failed to update member role" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentMembership = await prisma.workspaceMember.findFirst({
      where: { workspaceId: id, userId: currentUser.id },
    });

    if (!currentMembership || !canAccessWorkspace(currentMembership.role as any, "workspace:member:remove")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const memberId = typeof body?.memberId === "string" ? body.memberId : null;

    if (!memberId) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    const targetMembership = await prisma.workspaceMember.findFirst({
      where: { id: memberId, workspaceId: id },
    });

    if (!targetMembership) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (targetMembership.userId === currentUser.id) {
      return NextResponse.json({ error: "You cannot remove yourself" }, { status: 400 });
    }

    await prisma.workspaceMember.delete({ where: { id: memberId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Workspace member delete error:", error);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
