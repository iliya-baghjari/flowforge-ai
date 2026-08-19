import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "workspace";
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const workspaces = await prisma.workspace.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
      },
    });

    return NextResponse.json(workspaces);
  } catch (error) {
    console.error("Workspace fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch workspaces" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const name = String(body?.name ?? "").trim();
    const logoUrl = typeof body?.logoUrl === "string" ? body.logoUrl : null;

    if (!name) {
      return NextResponse.json({ error: "Workspace name is required" }, { status: 400 });
    }

    const baseSlug = String(body?.slug ?? slugify(name));
    let slug = baseSlug.trim();
    if (!slug) slug = slugify(name);

    const existing = await prisma.workspace.findFirst({
      where: {
        userId: user.id,
        slug,
      },
    });

    if (existing) {
      let counter = 2;
      let candidate = `${slug}-${counter}`;
      while (await prisma.workspace.findFirst({ where: { userId: user.id, slug: candidate } })) {
        counter += 1;
        candidate = `${slug}-${counter}`;
      }
      slug = candidate;
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        logoUrl,
        userId: user.id,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
      },
    });

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    console.error("Workspace creation error:", error);
    return NextResponse.json({ error: "Failed to create workspace" }, { status: 500 });
  }
}
