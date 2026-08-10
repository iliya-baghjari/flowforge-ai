import * as React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkHref: string;
  footerLinkLabel: string;
  className?: string;
}

export const AuthShell: React.FC<AuthShellProps> = ({
  title,
  subtitle,
  children,
  footerText,
  footerLinkHref,
  footerLinkLabel,
  className,
}) => {
  return (
    <div className="min-h-screen bg-[radial-linear(circle_at_top,rgba(79,70,229,0.16),transparent_55%)]  px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col overflow-hidden rounded-3xl border border-border/60 bg-card/90 shadow-2xl shadow-black/5 backdrop-blur-xl lg:flex-row">
        <section className="flex flex-1 flex-col justify-between bg-linear-to-br from-primary/10 via-background to-violet-500/10 p-8 sm:p-10 lg:w-[46%]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              FlowForge AI
            </div>
            <h1 className="mt-8 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Welcome back to your AI workspace.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
              Keep your product milestones, prompts, and launches moving in one elegant space.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Why teams use FlowForge</p>
            <p className="mt-2">Fast handoffs, guided planning, and a calmer way to manage every sprint.</p>
          </div>
        </section>

        <section className={cn("flex-1 p-8 sm:p-10", className)}>
          <div className="mx-auto max-w-md">
            <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{subtitle}</p>
            <div className="mt-8">{children}</div>
            <p className="mt-8 text-sm text-muted-foreground">
              {footerText}{" "}
              <Link href={footerLinkHref} className="font-semibold text-primary hover:underline">
                {footerLinkLabel}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
