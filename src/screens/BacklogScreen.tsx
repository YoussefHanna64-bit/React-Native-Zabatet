import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Button, Menu, Text, TextInput } from "react-native-paper";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import type {
  CommentDoc,
  TaskDoc,
  TaskStatus,
} from "../features/backlog/types/backlog.types";
import {
  line,
  muted,
  purple,
  text as textColor,
} from "../features/backlog/constants/backlog.constants";
import SprintSection from "../features/backlog/components/SprintSection";
import CreateIssueDialog from "../features/backlog/components/CreateIssueDialog";
import TaskDetailsDialog from "../features/backlog/components/TaskDetailsDialog";
import BoardSelector from "../features/boards/components/BoardSelector";
import {
  getApiError,
  uniqueById,
} from "../features/backlog/utils/backlog.utils";
import {
  getTaskComments,
  createTaskComment,
  updateTask,
} from "../features/backlog/api/backlog.api";
import { useBacklogFilters } from "../features/backlog/hooks/useBacklogFilters";
import { useBacklogData } from "../features/backlog/hooks/useBacklogData";

const STATUS_FILTERS: Array<"All" | TaskStatus> = [
  "All",
  "Backlog",
  "To Do",
  "In Progress",
  "Review",
  "Done",
];

export default function BacklogScreen() {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();

  const {
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
  } = useBacklogData(currentWorkspace?.name);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | TaskStatus>("All");
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [comments, setComments] = useState<CommentDoc[]>([]);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>(
    {},
  );
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [savingTask, setSavingTask] = useState(false);

  const selectedBoard = boards.find((b) => b._id === selectedBoardId) ?? null;

  const selectedTask = useMemo(
    () => tasks.find((task) => task._id === selectedTaskId) ?? null,
    [tasks, selectedTaskId],
  );

  const { issueNumbers, groups } = useBacklogFilters({
    tasks,
    sprints,
    search,
    statusFilter,
  });

  useEffect(() => {
    if (tasks.length === 0) {
      setCommentCounts({});
      return;
    }

    let cancelled = false;

    Promise.all(
      tasks.map(
        async (task) =>
          [task._id, (await getTaskComments(task._id)).length] as const,
      ),
    )
      .then((entries) => {
        if (!cancelled) setCommentCounts(Object.fromEntries(entries));
      })
      .catch(() => {
        if (!cancelled) setCommentCounts({});
      });
    return () => {
      cancelled = true;
    };
  }, [tasks]);

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
    if (!selectedTaskId) {
      return;
    }

    setSavingTask(true);
    setError("");

    const previousTasks = tasks;

    setTasks((current) =>
      current.map((task) =>
        task._id === selectedTaskId ? { ...task, ...patch } : task,
      ),
    );

    try {
      const updated = await updateTask(selectedTaskId, patch);

      setTasks((current) =>
        current.map((task) =>
          task._id === selectedTaskId ? { ...task, ...updated } : task,
        ),
      );
    } catch (err: any) {
      setTasks(previousTasks);
      setError(getApiError(err, "Failed to save task"));
    } finally {
      setSavingTask(false);
    }
  };

  const handleAddComment = async (commentText: string) => {
    if (!selectedTaskId) {
      return;
    }

    const created = await createTaskComment(selectedTaskId, commentText);

    const commentWithFallbackUser: CommentDoc = {
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

    setComments((current) => [...current, commentWithFallbackUser]);

    setCommentCounts((current) => ({
      ...current,
      [selectedTaskId]: (current[selectedTaskId] ?? 0) + 1,
    }));
  };

  const handleCreatedIssue = (task: TaskDoc) => {
    setTasks((current) => uniqueById([task, ...current]));
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={purple} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <BoardSelector
        boards={boards}
        selectedId={selectedBoardId}
        onSelect={selectBoard}
        onBoardCreated={handleBoardCreated}
        workspaceId={workspace?._id ?? null}
        loading={loading}
      />

      <View style={[styles.body, loadingBoard && styles.bodyLoading]}>
        <View style={styles.toolbar}>
          <TextInput
            mode="outlined"
            value={search}
            onChangeText={setSearch}
            placeholder="Search backlog..."
            dense
            left={<TextInput.Icon icon="magnify" />}
            style={styles.searchInput}
          />

          <Menu
            visible={filterMenuOpen}
            onDismiss={() => setFilterMenuOpen(false)}
            anchor={
              <Button
                mode="outlined"
                icon="filter-variant"
                onPress={() => setFilterMenuOpen(true)}
                compact
              >
                {statusFilter}
              </Button>
            }
          >
            {STATUS_FILTERS.map((status) => (
              <Menu.Item
                key={status}
                title={status}
                onPress={() => {
                  setStatusFilter(status);
                  setFilterMenuOpen(false);
                }}
              />
            ))}
          </Menu>

          <Button
            mode="contained"
            icon="plus"
            onPress={() => setCreateOpen(true)}
            disabled={!selectedBoardId}
            compact
            style={{ marginLeft: "auto" }}
          >
            Create Issue
          </Button>
        </View>

        {!!error && (
          <View style={styles.errorBanner}>
            <Text style={{ color: "#D32F2F" }}>{error}</Text>
          </View>
        )}

        <ScrollView style={{ flex: 1 }}>
          {!selectedBoardId ? (
            <View style={styles.centerBlock}>
              <Text style={styles.blockTitle}>No board found</Text>
              <Text style={styles.blockSubtitle}>
                Create a board first, then return to the backlog.
              </Text>
            </View>
          ) : tasks.length === 0 ? (
            <View style={styles.centerBlock}>
              <Text style={styles.blockTitle}>No backlog tasks yet</Text>
              <Text style={styles.blockSubtitle}>
                Use Create Issue to add your first task.
              </Text>
              <Button
                mode="contained"
                icon="plus"
                onPress={() => setCreateOpen(true)}
                style={{ marginTop: 12 }}
              >
                Create Issue
              </Button>
            </View>
          ) : groups.every((group) => group.tasks.length === 0) ? (
            <View style={styles.centerBlock}>
              <Text style={styles.blockTitle}>No tasks match this filter</Text>
              <Text style={styles.blockSubtitle}>
                Try another search word or status filter.
              </Text>
            </View>
          ) : (
            groups.map((group) => (
              <SprintSection
                key={group.id}
                group={group}
                issueNumbers={issueNumbers}
                commentCounts={commentCounts}
                onOpenTask={(task) => setSelectedTaskId(task._id)}
              />
            ))
          )}
        </ScrollView>
      </View>

      <CreateIssueDialog
        visible={createOpen}
        board={selectedBoard}
        sprints={sprints}
        teamMembers={teamMembers}
        onDismiss={() => setCreateOpen(false)}
        onCreated={handleCreatedIssue}
      />

      <TaskDetailsDialog
        visible={Boolean(selectedTask)}
        task={selectedTask}
        issueKey={selectedTask ? issueNumbers[selectedTask._id] : ""}
        sprints={sprints}
        teamMembers={teamMembers}
        comments={comments}
        commentsLoading={commentsLoading}
        saving={savingTask}
        onDismiss={() => setSelectedTaskId(null)}
        onPatch={handlePatchSelectedTask}
        onAddComment={handleAddComment}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  body: {
    flex: 1,
  },
  bodyLoading: {
    opacity: 0.5,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: line,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  errorBanner: {
    margin: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#FFEBEE",
  },
  centerBlock: {
    paddingVertical: 60,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  blockTitle: {
    color: textColor,
    fontWeight: "700",
    marginBottom: 4,
  },
  blockSubtitle: {
    color: muted,
    textAlign: "center",
  },
});
