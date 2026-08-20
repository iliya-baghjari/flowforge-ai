"use client";

import * as React from "react";
import { AlertTriangle, Check, Mail, Shield, Trash2, UserMinus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  WORKSPACE_ROLE_LABELS,
  WorkspaceRoles,
  type WorkspaceRole,
} from "@/lib/workspace-permissions";

interface WorkspaceMemberRecord {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

interface InviteRecord {
  id: string;
  email: string;
  role: string;
  token: string;
  expiresAt: string;
  inviteUrl?: string;
}

export function WorkspaceAdminPanel({ workspaceId }: { workspaceId: string }) {
  const [members, setMembers] = React.useState<WorkspaceMemberRecord[]>([]);
  const [invites, setInvites] = React.useState<InviteRecord[]>([]);
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<WorkspaceRole>(WorkspaceRoles.MEMBER);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [confirmMemberId, setConfirmMemberId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadData = async () => {
      const [membersRes, invitesRes] = await Promise.all([
        fetch(`/api/workspaces/${workspaceId}/members`),
        fetch(`/api/workspaces/${workspaceId}/invites`),
      ]);

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData);
      }

      if (invitesRes.ok) {
        const invitesData = await invitesRes.json();
        setInvites(invitesData);
      }
    };

    loadData();
  }, [workspaceId]);

  const sendInvite = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Failed to send invitation");

      setInvites((current) => [
        {
          id: data.id,
          email: data.email,
          role: data.role,
          token: data.token,
          expiresAt: data.expiresAt,
          inviteUrl: data.inviteUrl,
        },
        ...current,
      ]);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (memberId: string, nextRole: string) => {
    const response = await fetch(`/api/workspaces/${workspaceId}/members`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, role: nextRole }),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data?.error ?? "Failed to update role");
      return;
    }

    setMembers((current) =>
      current.map((member) => (member.id === memberId ? { ...member, role: nextRole } : member)),
    );
  };

  const removeMember = async (memberId: string) => {
    const response = await fetch(`/api/workspaces/${workspaceId}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId }),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data?.error ?? "Failed to remove member");
      return;
    }

    setMembers((current) => current.filter((member) => member.id !== memberId));
    setConfirmMemberId(null);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Members & roles</h3>
        </div>

        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="rounded-xl border border-border/60 bg-background/60 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{member.user.name ?? member.user.email ?? "User"}</p>
                  <p className="text-xs text-muted-foreground">{member.user.email}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
                  {WORKSPACE_ROLE_LABELS[member.role as keyof typeof WORKSPACE_ROLE_LABELS] ?? member.role}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <select
                  value={member.role}
                  onChange={(event) => updateRole(member.id, event.target.value)}
                  className="rounded-lg border border-border/60 bg-background px-2 py-1.5 text-sm"
                >
                  <option value={WorkspaceRoles.ADMIN}>Admin</option>
                  <option value={WorkspaceRoles.MEMBER}>Member</option>
                  <option value={WorkspaceRoles.VIEWER}>Viewer</option>
                </select>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmMemberId(member.id)}
                  className="ml-auto gap-1 text-red-600 hover:text-red-700"
                >
                  <UserMinus className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Pending invites</h3>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="invite@company.com"
              className="flex-1 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as WorkspaceRole)}
              className="rounded-lg border border-border/60 bg-background px-2 py-2 text-sm"
            >
              <option value={WorkspaceRoles.ADMIN}>Admin</option>
              <option value={WorkspaceRoles.MEMBER}>Member</option>
              <option value={WorkspaceRoles.VIEWER}>Viewer</option>
            </select>
          </div>

          <Button onClick={sendInvite} disabled={loading || !email.trim()} className="w-full">
            {loading ? "Sending..." : "Send invite"}
          </Button>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {invites.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending invites.</p>
          ) : (
            invites.map((invite) => (
              <div key={invite.id} className="rounded-xl border border-border/60 bg-background/60 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{invite.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {WORKSPACE_ROLE_LABELS[invite.role as keyof typeof WORKSPACE_ROLE_LABELS] ?? invite.role}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-700">
                    Pending
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <input
                    value={invite.inviteUrl ?? `${window.location.origin}/invite/${invite.token}`}
                    readOnly
                    className="flex-1 rounded-lg border border-border/60 bg-background px-2 py-2 text-xs text-muted-foreground"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard?.writeText(invite.inviteUrl ?? `${window.location.origin}/invite/${invite.token}`)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {confirmMemberId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-5 shadow-xl">
            <div className="mb-4 flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <h4 className="text-lg font-semibold">Remove member?</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              This action removes the member from the workspace immediately. They will lose access unless re-invited.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmMemberId(null)}>
                Cancel
              </Button>
              <Button onClick={() => removeMember(confirmMemberId)} className="bg-red-600 hover:bg-red-700">
                <Trash2 className="h-4 w-4" />
                Confirm removal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
