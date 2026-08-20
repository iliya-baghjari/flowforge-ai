"use client";

import * as React from "react";
import {
  Archive,
  ArchiveRestore,
  FolderKanban,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/store/workspace-store";

interface ProjectRecord {
  id: string;
  name: string;
  description: string | null;
  status: string;
  archived: boolean;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

const defaultDraft = {
  name: "",
  description: "",
  status: "active",
  archived: false,
};

export function ProjectManager() {
  const { currentWorkspaceId } = useWorkspaceStore();
  const [projects, setProjects] = React.useState<ProjectRecord[]>([]);
  const [draft, setDraft] = React.useState(defaultDraft);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);

  const loadProjects = React.useCallback(async () => {
    if (!currentWorkspaceId) {
      setProjects([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects?workspaceId=${currentWorkspaceId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to load projects");
      }

      setProjects(Array.isArray(data.projects) ? data.projects : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [currentWorkspaceId]);

  React.useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const activeProjects = projects.filter((project) => !project.archived);
  const archivedProjects = projects.filter((project) => project.archived);

  const resetForm = () => {
    setDraft(defaultDraft);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!currentWorkspaceId) {
      setError("Select a workspace before creating a project.");
      return;
    }

    const cleanName = draft.name.trim();
    if (!cleanName) {
      setError("Project name is required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        workspaceId: currentWorkspaceId,
        name: cleanName,
        description: draft.description.trim() || null,
        status: draft.status,
        archived: draft.archived,
      };

      const response = editingId
        ? await fetch(`/api/projects/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to save project");
      }

      setProjects((current) => {
        const next = current.filter((project) => project.id !== data.id);
        return [data, ...next].sort((left, right) => Number(right.archived) - Number(left.archived));
      });

      resetForm();
      await loadProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save project");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project: ProjectRecord) => {
    setEditingId(project.id);
    setDraft({
      name: project.name,
      description: project.description ?? "",
      status: project.status,
      archived: project.archived,
    });
  };

  const handleArchive = async (projectId: string, archived: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to update project status");
      }

      setProjects((current) =>
        current.map((project) =>
          project.id === projectId
            ? {
                ...project,
                archived: data.archived,
                status: data.status,
                updatedAt: data.updatedAt,
              }
            : project,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update project status");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to delete project");
      }

      setProjects((current) => current.filter((project) => project.id !== projectId));
      setConfirmDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project");
    } finally {
      setLoading(false);
    }
  };

  if (!currentWorkspaceId) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-6 text-sm text-muted-foreground shadow-sm">
        Select a workspace to manage projects.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <FolderKanban className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            {editingId ? "Edit project" : "Create project"}
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-foreground">Project name</label>
            <input
              value={draft.name}
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="Website redesign"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              value={draft.description}
              onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="Brief summary of the project goals and scope"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Status</label>
            <select
              value={draft.status}
              onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}
              className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Visibility</label>
            <label className="flex h-[42px] items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={draft.archived}
                onChange={(event) => setDraft((current) => ({ ...current, archived: event.target.checked }))}
              />
              Archive this project
            </label>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={handleSubmit} disabled={loading} className="gap-2">
            {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {loading ? "Saving..." : editingId ? "Save project" : "Create project"}
          </Button>

          {editingId && (
            <Button variant="outline" onClick={resetForm} className="gap-2">
              <X className="h-4 w-4" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Active projects</h3>
            <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              {activeProjects.length}
            </span>
          </div>

          {loading && projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">Loading projects...</p>
          ) : activeProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active projects yet.</p>
          ) : (
            <div className="space-y-3">
              {activeProjects.map((project) => (
                <div key={project.id} className="rounded-xl border border-border/60 bg-background/60 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.status}</p>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-700">
                      Active
                    </span>
                  </div>

                  {project.description && (
                    <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(project)} className="gap-1">
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleArchive(project.id, true)} className="gap-1">
                      <Archive className="h-3.5 w-3.5" />
                      Archive
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmDeleteId(project.id)}
                      className="gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Archived projects</h3>
            <span className="rounded-full bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-700">
              {archivedProjects.length}
            </span>
          </div>

          {archivedProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No archived projects.</p>
          ) : (
            <div className="space-y-3">
              {archivedProjects.map((project) => (
                <div key={project.id} className="rounded-xl border border-border/60 bg-background/60 p-3 opacity-80">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.status}</p>
                    </div>
                    <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-700">
                      Archived
                    </span>
                  </div>

                  {project.description && (
                    <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(project)} className="gap-1">
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleArchive(project.id, false)} className="gap-1">
                      <ArchiveRestore className="h-3.5 w-3.5" />
                      Restore
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmDeleteId(project.id)}
                      className="gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-5 shadow-xl">
            <p className="text-lg font-semibold text-foreground">Delete this project?</p>
            <p className="mt-2 text-sm text-muted-foreground">
              This permanently removes the project and all related task data.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
                Cancel
              </Button>
              <Button onClick={() => handleDelete(confirmDeleteId)} className="bg-red-600 hover:bg-red-700">
                Delete project
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
