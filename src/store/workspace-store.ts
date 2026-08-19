import { create } from "zustand";

export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
}

interface WorkspaceState {
  workspaces: WorkspaceSummary[];
  currentWorkspaceId: string | null;
  setWorkspaces: (workspaces: WorkspaceSummary[]) => void;
  setCurrentWorkspaceId: (workspaceId: string | null) => void;
}

const STORAGE_KEY = "flowforge-selected-workspace";

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  currentWorkspaceId: null,
  setWorkspaces: (workspaces) => {
    const currentWorkspaceId = get().currentWorkspaceId;
    const nextId =
      currentWorkspaceId && workspaces.some((workspace) => workspace.id === currentWorkspaceId)
        ? currentWorkspaceId
        : workspaces[0]?.id ?? null;

    if (typeof window !== "undefined") {
      if (nextId) {
        window.localStorage.setItem(STORAGE_KEY, nextId);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    set({ workspaces, currentWorkspaceId: nextId });
  },
  setCurrentWorkspaceId: (workspaceId) => {
    if (typeof window !== "undefined") {
      if (workspaceId) {
        window.localStorage.setItem(STORAGE_KEY, workspaceId);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    set({ currentWorkspaceId: workspaceId });
  },
}));

export function getStoredWorkspaceId() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}
