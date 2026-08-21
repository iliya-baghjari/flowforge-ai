"use client";

import * as React from "react";
import { Bot, BrainCircuit, Sparkles, Wand2 } from "lucide-react";

interface ProjectSummary {
  id: string;
  name: string;
  color: string | null;
}

interface MemberSummary {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
}

interface AiMessage {
  id: string;
  role: "assistant" | "user";
  title: string;
  content: string;
}

interface AIAssistantPanelProps {
  workspaceId: string | null;
  tasks: Array<{
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    dueDate: string | null;
  }>;
  projects: ProjectSummary[];
  members: MemberSummary[];
}

const QUICK_ACTIONS = [
  { label: "Generate tasks", mode: "generate_tasks" },
  { label: "Sprint plan", mode: "sprint_planning" },
  { label: "Task summary", mode: "task_summary" },
  { label: "Rewrite task", mode: "rewrite_task" },
  { label: "Estimate time", mode: "estimate_time" },
  { label: "Suggest priority", mode: "suggest_priority" },
  { label: "Docs draft", mode: "generate_documentation" },
] as const;

export function AIAssistantPanel({ workspaceId, tasks, projects, members }: AIAssistantPanelProps) {
  const [messages, setMessages] = React.useState<AiMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      title: "AI workspace assistant",
      content:
        "Ask for sprint planning, task generation, summaries, or priority recommendations using the current project and task context.",
    },
  ]);
  const [input, setInput] = React.useState("Plan a secure auth feature with signup, login, and email verification.");
  const [loading, setLoading] = React.useState(false);
  const [selectedMode, setSelectedMode] = React.useState<(typeof QUICK_ACTIONS)[number]["mode"]>("generate_tasks");

  const askAssistant = React.useCallback(
    async (promptOverride?: string, modeOverride?: string) => {
      const prompt = (promptOverride ?? input).trim();
      if (!prompt || !workspaceId) {
        setMessages((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            title: "Workspace required",
            content: "Select a workspace before using the AI assistant.",
          },
        ]);
        return;
      }

      const mode = modeOverride ?? selectedMode;
      setLoading(true);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "user",
          title: "Your prompt",
          content: prompt,
        },
      ]);

      try {
        const response = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId,
            mode,
            prompt,
            context: {
              tasks: tasks.slice(0, 10),
              projects: projects.slice(0, 10),
              members: members.slice(0, 10),
            },
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error ?? "AI request failed");
        }

        const content =
          typeof data?.content === "string"
            ? data.content
            : typeof data?.summary === "string"
              ? data.summary
              : JSON.stringify(data, null, 2);

        const title =
          mode === "generate_tasks"
            ? "Generated tasks"
            : mode === "sprint_planning"
              ? "Sprint recommendation"
              : mode === "task_summary"
                ? "Task summary"
                : mode === "rewrite_task"
                  ? "Rewritten task"
                  : mode === "estimate_time"
                    ? "Time estimate"
                    : mode === "suggest_priority"
                      ? "Priority suggestion"
                      : mode === "generate_documentation"
                        ? "Documentation draft"
                        : "AI response";

        setMessages((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            title,
            content,
          },
        ]);
      } catch (error) {
        setMessages((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            title: "AI request failed",
            content: error instanceof Error ? error.message : "Something went wrong while generating AI output.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, members, projects, selectedMode, tasks, workspaceId],
  );

  return (
    <aside className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm xl:sticky xl:top-24 xl:h-fit">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">AI Workspace</p>
            <p className="text-[11px] text-muted-foreground">Project-aware planning</p>
          </div>
        </div>
        <div className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
          AI
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.mode}
            type="button"
            onClick={() => {
              setSelectedMode(action.mode);
              void askAssistant(input || "Plan an improvement for this workspace.", action.mode);
            }}
            className={[
              "rounded-full border px-2.5 py-1.5 text-[11px] font-medium transition",
              selectedMode === action.mode
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:border-primary/30",
            ].join(" ")}
          >
            {action.label}
          </button>
        ))}
      </div>

      <div className="space-y-3 pb-3">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground">
          <BrainCircuit className="h-4 w-4 text-primary" />
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Tell the AI what to do..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <button
          type="button"
          onClick={() => void askAssistant()}
          disabled={loading || !workspaceId}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Wand2 className="h-4 w-4" />
          {loading ? "Working..." : "Run AI action"}
        </button>
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-background/40 p-3">
        {messages.slice(-4).map((message) => (
          <div
            key={message.id}
            className={[
              "rounded-xl border p-3",
              message.role === "assistant" ? "border-primary/20 bg-primary/5" : "border-border bg-background",
            ].join(" ")}
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {message.role === "assistant" ? "AI" : "You"}
              </span>
              <span className="text-[10px] text-muted-foreground">{message.title}</span>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">{message.content}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-primary/25 bg-primary/5 px-3 py-2 text-xs text-primary">
        <Sparkles className="h-3.5 w-3.5" />
        Context-aware suggestions from the active workspace.
      </div>
    </aside>
  );
}
