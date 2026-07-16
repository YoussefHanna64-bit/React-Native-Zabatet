import { useCallback, useEffect, useState } from "react";

import type {
  BoardDoc,
  SprintDoc,
  TaskDoc,
  UserDoc,
  WorkspaceDoc,
} from "../types/backlog.types";

import { getApiError } from "../utils/backlog.utils";

import {
  getAllUsers,
  getBoardsForWorkspace,
  getSprintsByBoard,
  getTasksByBoard,
  getWorkspaceMembers,
  getWorkspaces,
} from "../api/backlog.api";

export function useBacklogData(projectId?: string) {
  const [workspace, setWorkspace] = useState<WorkspaceDoc | null>(null);
  const [boards, setBoards] = useState<BoardDoc[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [sprints, setSprints] = useState<SprintDoc[]>([]);
  const [tasks, setTasks] = useState<TaskDoc[]>([]);
  const [teamMembers, setTeamMembers] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBoard, setLoadingBoard] = useState(false);
  const [error, setError] = useState("");

  const loadWorkspaceAndBoards = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const workspaces = await getWorkspaces();

      const ws =
        workspaces.find(
          (item) =>
            item.name === projectId ||
            item.name.toLowerCase().replace(/\s+/g, "-") ===
              projectId.toLowerCase(),
        ) ?? workspaces[0];

      if (!ws) {
        setBoards([]);
        setSelectedBoardId(null);
        setTasks([]);
        setSprints([]);
        setTeamMembers([]);
        setLoading(false);
        return;
      }

      setWorkspace(ws);

      const [boardList, members] = await Promise.all([
        getBoardsForWorkspace(ws._id),
        getWorkspaceMembers(ws._id).catch(async () => getAllUsers()),
      ]);

      setBoards(boardList);
      setTeamMembers(members);

      if (boardList.length > 0) {
        setSelectedBoardId(boardList[0]._id);
      } else {
        setSelectedBoardId(null);
        setTasks([]);
        setSprints([]);
        setLoading(false);
      }
    } catch (err: any) {
      setError(getApiError(err, "Failed to load backlog"));
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadWorkspaceAndBoards();
  }, [loadWorkspaceAndBoards]);

  useEffect(() => {
    if (!selectedBoardId) return;

    setLoadingBoard(true);

    Promise.all([
      getSprintsByBoard(selectedBoardId),
      getTasksByBoard(selectedBoardId),
    ])
      .then(([loadedSprints, loadedTasks]) => {
        setSprints(loadedSprints);
        setTasks(loadedTasks);
      })
      .catch((err: any) => {
        setError(getApiError(err, "Failed to load board data"));
      })
      .finally(() => {
        setLoading(false);
        setLoadingBoard(false);
      });
  }, [selectedBoardId]);

  const selectBoard = (boardId: string) => {
    if (boardId === selectedBoardId) return;
    setSelectedBoardId(boardId);
    setTasks([]);
    setSprints([]);
  };

  const handleBoardCreated = (board: BoardDoc) => {
    setBoards((prev) => [...prev, board]);
    setSelectedBoardId(board._id);
    setTasks([]);
    setSprints([]);
  };

  return {
    workspace,
    boards,
    selectedBoardId,
    sprints,
    tasks,
    setTasks,
    teamMembers,
    loading,
    loadingBoard,
    error,
    setError,
    selectBoard,
    handleBoardCreated,
    reloadBacklog: loadWorkspaceAndBoards,
  };
}
