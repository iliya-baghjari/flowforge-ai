import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessWorkspace, WorkspaceRoles } from "@/lib/workspace-permissions";
import { NextResponse } from "next/server";

function createInviteToken() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

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

    const invites = await prisma.workspaceInvite.findMany({
      where: { workspaceId: id },
      include: {
        invitedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invites);
  } catch (error) {
    console.error("Workspaces invite fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch invites" }, { status: 500 });
  }
}

export async function POST(
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

    if (!currentMembership || !canAccessWorkspace(currentMembership.role as any, "workspace:invite")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const role = typeof body?.role === "string" ? body.role : WorkspaceRoles.MEMBER;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (![WorkspaceRoles.ADMIN, WorkspaceRoles.MEMBER, WorkspaceRoles.VIEWER].includes(role as any)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const existingMember = await prisma.workspaceMember.findFirst({
      where: { workspaceId: id, user: { email } },
      include: { user: true },
    });

    if (existingMember) {
      return NextResponse.json({ error: "User is already a member of this workspace" }, { status: 400 });
    }

    const invite = await prisma.workspaceInvite.create({
      data: {
        workspaceId: id,
        email,
        role,
        token: createInviteToken(),
        invitedById: currentUser.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
      include: {
        invitedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({
      ...invite,
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/workspaces/${id}/accept-invite?token=${invite.token}`,
    });
  } catch (error) {
    console.error("Workspace invite create error:", error);
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
  }
}
