"use client";

import * as React from "react";
import { AlertTriangle, ImagePlus, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface WorkspaceSettingsFormProps {
  workspaceId: string;
  initialName: string;
  initialSlug: string;
  initialLogoUrl?: string | null;
}

export function WorkspaceSettingsForm({
  workspaceId,
  initialName,
  initialSlug,
  initialLogoUrl,
}: WorkspaceSettingsFormProps) {
  const [name, setName] = React.useState(initialName);
  const [slug, setSlug] = React.useState(initialSlug);
  const [logoUrl, setLogoUrl] = React.useState(initialLogoUrl ?? "");
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const save = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          logoUrl: logoUrl.trim() || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Failed to update workspace");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update workspace");
    } finally {
      setSaving(false);
    }
  };

  const deleteWorkspace = async () => {
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Failed to delete workspace");
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete workspace");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground">Workspace details</h3>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Workspace name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Workspace slug</label>
            <input
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Logo URL</label>
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-2">
              <ImagePlus className="h-4 w-4 text-muted-foreground" />
              <input
                value={logoUrl}
                onChange={(event) => setLogoUrl(event.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button onClick={save} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm dark:border-red-900/40 dark:bg-red-950/10">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
          <Trash2 className="h-4 w-4" />
          <h3 className="text-lg font-semibold">Delete workspace</h3>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          This permanently removes the workspace and its associated data.
        </p>

        {!confirmDelete ? (
          <Button variant="outline" onClick={() => setConfirmDelete(true)} className="mt-4 border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300">
            Delete workspace
          </Button>
        ) : (
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button onClick={deleteWorkspace} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              <AlertTriangle className="h-4 w-4" />
              {deleting ? "Deleting..." : "Confirm delete"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
