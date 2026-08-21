import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessWorkspace } from "@/lib/workspace-permissions";
import { NextResponse } from "next/server";

const VALID_MODES = new Set([
  "generate_tasks",
  "sprint_planning",
  "task_summary",
  "rewrite_task",
  "estimate_time",
  "suggest_priority",
  "generate_documentation",
]);

function buildSystemPrompt(mode: string, context: any) {
  const tasks = context?.tasks ?? [];
  const projects = context?.projects ?? [];
  const members = context?.members ?? [];

  const taskSummary = tasks.length
    ? tasks
        .slice(0, 8)
        .map(
          (task: any) =>
            `- ${task.title} | status: ${task.status} | priority: ${task.priority} | due: ${task.dueDate ?? "none"}`,
        )
        .join("\n")
    : "- No tasks available";

  const projectSummary = projects.length
    ? projects
        .slice(0, 6)
        .map((project: any) => `- ${project.name}`)
        .join("\n")
    : "- No projects available";

  const memberSummary = members.length
    ? members
        .slice(0, 6)
        .map((member: any) => `- ${member.user?.name ?? member.user?.email ?? "Member"}`)
        .join("\n")
    : "- No members available";

  const modePromptMap: Record<string, string> = {
    generate_tasks: `You are an agile product planning assistant. Generate realistic tasks from a user request. Return concise, actionable task suggestions as a bullet list. Each item should include a title and a short description.`,
    sprint_planning: `You are an agile delivery coach. Suggest a sprint scope based on backlog tasks and current priorities. Return a practical plan grouped by must-have, should-have, and stretch.` ,
    task_summary: `You are a project summarizer. Summarize the task context and current workload into a short executive summary with clear risks and next steps.`,
    rewrite_task: `You are a task editor. Rewrite task descriptions for clarity and actionability. Favor structured, concise writing and preserve intent.`,
    estimate_time: `You are an engineering estimator. Estimate the required hours for the described work using a realistic range and a short rationale.`,
    suggest_priority: `You are a prioritization assistant. Recommend a priority level with a brief rationale based on urgency, impact, and risk.`,
    generate_documentation: `You are a technical writer. Draft concise technical documentation based on the project and task details.`,
  };

  return `You are FlowForge AI, an assistant for a product/project workspace.

Mode: ${mode}
Context:
Projects:
${projectSummary}

Tasks:
${taskSummary}

Members:
${memberSummary}

Instructions:
- Use only the workspace context provided.
- Be concise but useful.
- Reply in plain text with clear sections and bullet points.
- If a request is ambiguous, make a reasonable assumption and state it briefly.

${modePromptMap[mode] ?? modePromptMap.generate_tasks}
`;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const workspaceId = typeof body?.workspaceId === "string" ? body.workspaceId : null;
    const mode = typeof body?.mode === "string" ? body.mode : "generate_tasks";
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";

    if (!workspaceId || !prompt) {
      return NextResponse.json({ error: "Workspace ID and prompt are required" }, { status: 400 });
    }

    if (!VALID_MODES.has(mode)) {
      return NextResponse.json({ error: "Unsupported AI mode" }, { status: 400 });
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

    const systemPrompt = buildSystemPrompt(mode, body?.context ?? {});

    const content = `${systemPrompt}\n\nUser request:\n${prompt}`;

    return NextResponse.json({
      content: `AI output for ${mode}:\n\n${content}\n\nSuggested next step: use this response as a planning draft and refine it with real project details before creating tasks.`,
      summary: `This AI response was generated for the ${mode} mode using the active workspace context.`,
    });
  } catch (error) {
    console.error("AI route error:", error);
    return NextResponse.json({ error: "Failed to generate AI content" }, { status: 500 });
  }
}
