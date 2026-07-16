import { useEffect, useMemo, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api/api";

import {
  getTaskComments,
  createTaskComment,
  updateTask,
  getWorkspaceMembers,
} from "../../backlog/api/backlog.api";
import type {
  CommentDoc,
  UserDoc as BacklogUserDoc,
} from "../../backlog/types/backlog.types";
import { getApiError } from "../../backlog/utils/backlog.utils";

import type {
  BoardDoc,
  SprintDoc,
  TaskDoc,
  TaskStatus,
} from "../types/boards.types";

export interface UseBoardDataReturn {
  workspaceMongoId: string | null;
  workspaceError: string;

  boards: BoardDoc[];
  selectedBoardId: string | null;
  loadingBoards: boolean;
  boardsError: string;
  selectBoard: (id: string) => void;
  handleBoardCreated: (board: BoardDoc) => void;

  sprints: SprintDoc[];
  loadingSprints: boolean;
  selectedSprintId: string;
  setSelectedSprintId: (id: string) => void;

  tasks: TaskDoc[];
  loadingTasks: boolean;
  tasksError: string;
  issueNumbers: Record<string, string>;

  teamMembers: BacklogUserDoc[];

  selectedTask: TaskDoc | null;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  comments: CommentDoc[];
  commentsLoading: boolean;
  savingTask: boolean;
  handlePatchSelectedTask: (patch: Partial<TaskDoc>) => Promise<void>;
  handleAddComment: (text: string) => Promise<void>;

  handleCreatedIssue: (task: any) => void;

  moveTask: (taskId: string, to: TaskStatus) => Promise<void>;
}

export function useBoardData(projectId?: string): UseBoardDataReturn {
  const { user } = useAuth();
  const isFocused = useIsFocused();

  const [workspaceMongoId, setWorkspaceMongoId] = useState<string | null>(null);
  const [workspaceError, setWorkspaceError] = useState("");

  const [boards, setBoards] = useState<BoardDoc[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [boardsError, setBoardsError] = useState("");

  const [sprints, setSprints] = useState<SprintDoc[]>([]);
  const [loadingSprints, setLoadingSprints] = useState(false);
  const [selectedSprintId, setSelectedSprintId] = useState("");

  const [tasks, setTasks] = useState<TaskDoc[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [tasksError, setTasksError] = useState("");

  const [teamMembers, setTeamMembers] = useState<BacklogUserDoc[]>([]);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentDoc[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [savingTask, setSavingTask] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    api
      .get("/workspaces")
      .then(({ data }: any) => {
        const list: any[] = data.data ?? data;
        const ws = list.find(
          (w: any) =>
            w.name === projectId ||
            w.name.toLowerCase().replace(/\s+/g, "-") ===
              projectId.toLowerCase(),
        );
        setWorkspaceMongoId(ws ? ws._id : (list[0]?._id ?? null));
      })
      .catch(() => setWorkspaceError("Could not load workspace info"));
  }, [projectId]);

  useEffect(() => {
    if (!workspaceMongoId) return;
    getWorkspaceMembers(workspaceMongoId)
      .then(setTeamMembers)
      .catch(() => setTeamMembers([]));
  }, [workspaceMongoId]);

  useEffect(() => {
    if (!workspaceMongoId || !isFocused) return;
    let cancelled = false;
    if (boards.length === 0) setLoadingBoards(true);
    setBoardsError("");
    api
      .get(`/boards/workspace/${workspaceMongoId}`)
      .then(({ data }: any) => {
        if (cancelled) return;
        const list: BoardDoc[] = data.data ?? data;
        setBoards(list);
        setSelectedBoardId((prev) => {
          if (!prev) return list.length > 0 ? list[0]._id : null;
          if (!list.find((b) => b._id === prev))
            return list.length > 0 ? list[0]._id : null;
          return prev;
        });
      })
      .catch((e: any) => {
        if (!cancelled)
          setBoardsError(e?.response?.data?.message ?? "Failed to load boards");
      })
      .finally(() => {
        if (!cancelled) setLoadingBoards(false);
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceMongoId, isFocused]);

  useEffect(() => {
    if (!selectedBoardId || !isFocused) {
      if (!selectedBoardId) setSprints([]);
      return;
    }
    if (sprints.length === 0) setLoadingSprints(true);
    setSelectedSprintId("");
    api
      .get(`/sprints/board/${selectedBoardId}`)
      .then(({ data }: any) => setSprints(data.data ?? data ?? []))
      .catch(() => setSprints([]))
      .finally(() => setLoadingSprints(false));
  }, [selectedBoardId, isFocused]);

  useEffect(() => {
    if (!selectedBoardId || !isFocused) return;
    if (tasks.length === 0) setLoadingTasks(true);
    setTasksError("");
    api
      .get(`/tasks/board/${selectedBoardId}`)
      .then(({ data }: any) =>
        setTasks(Array.isArray(data) ? data : (data.data ?? [])),
      )
      .catch((e: any) =>
        setTasksError(e?.response?.data?.message ?? "Failed to load tasks"),
      )
      .finally(() => setLoadingTasks(false));
  }, [selectedBoardId, isFocused]);

  const issueNumbers = useMemo(
    () =>
      tasks.reduce<Record<string, string>>((acc, task, i) => {
        acc[task._id] = `ZAB-${i + 1}`;
        return acc;
      }, {}),
    [tasks],
  );

  const selectedTask = useMemo(
    () => tasks.find((t) => t._id === selectedTaskId) ?? null,
    [tasks, selectedTaskId],
  );

  useEffect(() => {
    if (!selectedTaskId) {
      setComments([]);
      return;
    }
    setCommentsLoading(true);
    getTaskComments(selectedTaskId)
      .then(setComments)
      .catch(() => setComments([]))
      .finally(() => setCommentsLoading(false));
  }, [selectedTaskId]);

  const handlePatchSelectedTask = async (patch: Partial<TaskDoc>) => {
    if (!selectedTaskId) return;
    setSavingTask(true);
    const previousTasks = tasks;
    setTasks((prev) =>
      prev.map((t) => (t._id === selectedTaskId ? { ...t, ...patch } : t)),
    );
    try {
      const updated = await updateTask(selectedTaskId, patch as any);
      setTasks((prev) =>
        prev.map((t) =>
          t._id === selectedTaskId ? { ...t, ...(updated as any) } : t,
        ),
      );
    } catch (err: any) {
      setTasks(previousTasks);
      setTasksError(getApiError(err, "Failed to save task"));
    } finally {
      setSavingTask(false);
    }
  };

  const handleAddComment = async (commentText: string) => {
    if (!selectedTaskId) return;
    const created = await createTaskComment(selectedTaskId, commentText);
    const commentWithUser: CommentDoc = {
      ...created,
      userId:
        typeof created.userId === "object" && created.userId
          ? created.userId
          : user
            ? {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
              }
            : created.userId,
      createdAt: created.createdAt ?? new Date().toISOString(),
    };
    setComments((prev) => [...prev, commentWithUser]);
  };

  const handleCreatedIssue = (task: any) => setTasks((prev) => [task, ...prev]);

  const selectBoard = (id: string) => {
    setSelectedBoardId(id);
    setTasks([]);
  };

  const handleBoardCreated = (board: BoardDoc) => {
    setBoards((prev) => [...prev, board]);
    setSelectedBoardId(board._id);
    setTasks([]);
    setSprints([]);
  };

  const moveTask = async (taskId: string, to: TaskStatus) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === to) return;
    const from = task.status;
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: to } : t)),
    );
    try {
      await api.put(`/tasks/${taskId}/status`, { status: to });
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: from } : t)),
      );
    }
  };

  return {
    workspaceMongoId,
    workspaceError,
    boards,
    selectedBoardId,
    loadingBoards,
    boardsError,
    selectBoard,
    handleBoardCreated,
    sprints,
    loadingSprints,
    selectedSprintId,
    setSelectedSprintId,
    tasks,
    loadingTasks,
    tasksError,
    issueNumbers,
    teamMembers,
    selectedTask,
    selectedTaskId,
    setSelectedTaskId,
    comments,
    commentsLoading,
    savingTask,
    handlePatchSelectedTask,
    handleAddComment,
    handleCreatedIssue,
    moveTask,
  };
}
