import { ArrowRight, Sparkles, Workflow } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-violet-500/10 p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Sprint 1 dashboard shell
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Build and ship faster with one elegant workspace.
            </h1>
            <p className="text-sm leading-7 text-muted-foreground sm:text-base">
              This dashboard combines a responsive sidebar, glassy navbar, and dark-mode-ready surface for your AI product team.
            </p>
          </div>
          <Button className="w-fit">
            Launch workspace
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Workflow className="h-4 w-4 text-primary" />
            Workflow overview
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Projects", value: "24" },
              { label: "Automations", value: "12" },
              { label: "Launches", value: "4" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-border/60 bg-background/80 p-4">
                <p className="text-2xl font-semibold text-foreground">{item.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Next milestone</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Prepare the command palette, workspace analytics, and richer task views for the next sprint.
          </p>
        </div>
      </section>
    </div>
  );
}
