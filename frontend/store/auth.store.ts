import { create } from "zustand";
import { UserMe } from "../types/api.types";
import { Workspace, Role } from "../types/app.types";

interface AuthState {
  user: UserMe | null;
  workspace: Workspace | null;
  workspaces: Workspace[];
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (payload: { user: UserMe; workspace: Workspace; workspaces: Workspace[]; role: Role; sessionToken?: string }) => void;
  clearAuth: () => void;
  switchWorkspace: (workspace: Workspace, role: Role) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  workspace: null,
  workspaces: [],
  role: null,
  isAuthenticated: false,
  isLoading: true,
  setAuth: ({ user, workspace, workspaces, role, sessionToken }) => {
    if (sessionToken && typeof window !== "undefined") {
      localStorage.setItem("soliqly_session", sessionToken);
    }
    set({
      user,
      workspace,
      workspaces,
      role,
      isAuthenticated: true,
      isLoading: false,
    });
  },
  clearAuth: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("soliqly_session");
    }
    set({
      user: null,
      workspace: null,
      workspaces: [],
      role: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
  switchWorkspace: (workspace, role) =>
    set({
      workspace,
      role,
    }),
  setLoading: (isLoading) => set({ isLoading }),
}));
