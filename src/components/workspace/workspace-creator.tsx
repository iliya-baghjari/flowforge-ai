"use client";

import * as React from "react";
import { ImagePlus, Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useWorkspaceStore, type WorkspaceSummary } from "@/store/workspace-store";

interface WorkspaceCreatorProps {
  onCreated?: (workspace: WorkspaceSummary) => void;
}

export function WorkspaceCreator({ onCreated }: WorkspaceCreatorProps) {
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [logoUrl, setLogoUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { setWorkspaces, workspaces } = useWorkspaceStore();

  React.useEffect(() => {
    if (!name) {
      setSlug("");
      return;
    }

    const generated = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "workspace";

    if (!slug || slug === "workspace") {
      setSlug(generated);
    }
  }, [name, slug]);

  const handleSubmit = async () => {
    const finalName = name.trim();
    const finalSlug = (slug || name).trim();

    if (!finalName) {
      setError("Workspace name is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: finalName,
          slug: finalSlug,
          logoUrl: logoUrl.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to create workspace.");
      }

      const nextWorkspace: WorkspaceSummary = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        logoUrl: data.logoUrl ?? null,
      };

      const nextWorkspaces = [nextWorkspace, ...workspaces.filter((item) => item.id !== nextWorkspace.id)];
      setWorkspaces(nextWorkspaces);
      setName("");
      setSlug("");
      setLogoUrl("");
      onCreated?.(nextWorkspace);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create workspace.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Create workspace</h3>
          <p className="text-sm text-muted-foreground">Name it, set a slug, and add a logo if needed.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Workspace name</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none ring-0 placeholder:text-muted-foreground focus:border-primary"
            placeholder="Northstar Labs"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Slug</label>
          <input
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none ring-0 placeholder:text-muted-foreground focus:border-primary"
            placeholder="northstar-labs"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Logo URL (optional)</label>
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-2">
            <ImagePlus className="h-4 w-4 text-muted-foreground" />
            <input
              value={logoUrl}
              onChange={(event) => setLogoUrl(event.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="https://.../logo.png"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button onClick={handleSubmit} disabled={loading} className="w-full">
          <Plus className="h-4 w-4" />
          {loading ? "Creating workspace..." : "Create workspace"}
        </Button>
      </div>
    </div>
  );
}
