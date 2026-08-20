import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const { id: workspaceId } = await params;
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!token) {
      return NextResponse.json({ error: "Invite token is required" }, { status: 400 });
    }

    const invite = await prisma.workspaceInvite.findUnique({
      where: { token },
    });

    if (!invite || invite.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    if (new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Invite has expired" }, { status: 410 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (invite.email.toLowerCase() !== user.email?.toLowerCase()) {
      return NextResponse.json({ error: "This invite is for a different email address" }, { status: 403 });
    }

    const existingMembership = await prisma.workspaceMember.findFirst({
      where: { workspaceId: invite.workspaceId, userId: user.id },
    });

    if (!existingMembership) {
      await prisma.workspaceMember.create({
        data: {
          workspaceId: invite.workspaceId,
          userId: user.id,
          role: invite.role,
        },
      });
    }

    await prisma.workspaceInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Accept invite error:", error);
    return NextResponse.json({ error: "Failed to accept invite" }, { status: 500 });
  }
}
