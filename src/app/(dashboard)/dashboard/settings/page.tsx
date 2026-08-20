"use client";

import * as React from "react";

import { WorkspaceAdminPanel } from "@/components/workspace/workspace-admin-panel";
import { WorkspaceSettingsForm } from "@/components/workspace/workspace-settings-form";
import { useWorkspaceStore } from "@/store/workspace-store";

export default function SettingsPage() {
  const { currentWorkspaceId, workspaces } = useWorkspaceStore();
  const workspace = workspaces.find((item) => item.id === currentWorkspaceId) ?? workspaces[0] ?? null;

  if (!workspace || !currentWorkspaceId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workspace settings</h1>
          <p className="text-muted-foreground mt-2">Create or select a workspace to manage settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Workspace settings</h1>
        <p className="text-muted-foreground mt-2">Manage members, permissions, invites, and workspace details.</p>
      </div>

      <WorkspaceSettingsForm
        workspaceId={currentWorkspaceId}
        initialName={workspace.name}
        initialSlug={workspace.slug}
        initialLogoUrl={workspace.logoUrl}
      />

      <WorkspaceAdminPanel workspaceId={currentWorkspaceId} />
    </div>
  );
}
