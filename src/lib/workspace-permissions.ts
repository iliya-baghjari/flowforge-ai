export const WorkspaceRoles = {
  ADMIN: "admin",
  MEMBER: "member",
  VIEWER: "viewer",
} as const;

export type WorkspaceRole = (typeof WorkspaceRoles)[keyof typeof WorkspaceRoles];

export const WORKSPACE_ROLE_LABELS: Record<WorkspaceRole, string> = {
  [WorkspaceRoles.ADMIN]: "Admin",
  [WorkspaceRoles.MEMBER]: "Member",
  [WorkspaceRoles.VIEWER]: "Viewer",
};

export const ROLE_PERMISSIONS: Record<WorkspaceRole, Set<string>> = {
  [WorkspaceRoles.ADMIN]: new Set([
    "workspace:read",
    "workspace:update",
    "workspace:delete",
    "workspace:invite",
    "workspace:member:manage",
    "workspace:member:remove",
  ]),
  [WorkspaceRoles.MEMBER]: new Set([
    "workspace:read",
    "workspace:update",
    "workspace:invite",
    "workspace:member:manage",
  ]),
  [WorkspaceRoles.VIEWER]: new Set(["workspace:read"]),
};

export function canAccessWorkspace(role: WorkspaceRole | null | undefined, permission: string) {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}
