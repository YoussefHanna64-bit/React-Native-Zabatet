import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import api from "../api/api";
import { useAuth } from "./AuthContext";

export interface WorkspaceSummary {
  _id: string;
  name: string;
  description?: string;
}

interface WorkspaceContextType {
  workspaces: WorkspaceSummary[];
  
  currentWorkspace: WorkspaceSummary | null;
  loading: boolean;
  selectWorkspace: (ws: WorkspaceSummary) => void;
  refresh: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [currentWorkspace, setCurrentWorkspace] =
    useState<WorkspaceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get("/workspaces");
      const list: WorkspaceSummary[] = data.data ?? data;
      setWorkspaces(Array.isArray(list) ? list : []);
      
      
      setCurrentWorkspace((prev) => {
        if (prev && list.some((w) => w._id === prev._id)) return prev;
        return list[0] ?? null;
      });
    } catch {
      setWorkspaces([]);
      setCurrentWorkspace(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        loading,
        selectWorkspace: setCurrentWorkspace,
        refresh,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx)
    throw new Error("useWorkspace must be used inside <WorkspaceProvider>");
  return ctx;
}
