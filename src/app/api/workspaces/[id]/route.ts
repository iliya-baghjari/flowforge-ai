import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessWorkspace, WorkspaceRoles } from "@/lib/workspace-permissions";
import { NextResponse } from "next/server";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "workspace";
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

    const membership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: id,
        user: { email: session.user.email },
      },
      include: {
        workspace: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    return NextResponse.json({
      workspace: membership.workspace,
      role: membership.role,
      member: membership.user,
    });
  } catch (error) {
    console.error("Workspace detail error:", error);
    return NextResponse.json({ error: "Failed to load workspace" }, { status: 500 });
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

    const membership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: id,
        userId: currentUser.id,
      },
    });

    if (!membership || !canAccessWorkspace(membership.role as any, "workspace:update")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : undefined;
    const slugInput = typeof body?.slug === "string" ? body.slug.trim() : undefined;
    const logoUrl = typeof body?.logoUrl === "string" ? body.logoUrl.trim() || null : undefined;

    if (!name && !slugInput && typeof logoUrl === "undefined") {
      return NextResponse.json({ error: "No updates supplied" }, { status: 400 });
    }

    const workspace = await prisma.workspace.findUnique({ where: { id } });
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const slug = slugInput ? slugify(slugInput) : workspace.slug;
    const nextName = name ?? workspace.name;

    const duplicate = await prisma.workspace.findFirst({
      where: {
        userId: workspace.userId,
        slug,
        id: { not: id },
      },
    });

    if (duplicate) {
      return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
    }

    const updated = await prisma.workspace.update({
      where: { id },
      data: {
        ...(nextName !== workspace.name ? { name: nextName } : {}),
        ...(slug !== workspace.slug ? { slug } : {}),
        ...(typeof logoUrl !== "undefined" ? { logoUrl } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Workspace update error:", error);
    return NextResponse.json({ error: "Failed to update workspace" }, { status: 500 });
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

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const membership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: id,
        userId: currentUser.id,
      },
    });

    if (!membership || membership.role !== WorkspaceRoles.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.workspace.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Workspace delete error:", error);
    return NextResponse.json({ error: "Failed to delete workspace" }, { status: 500 });
  }
}
