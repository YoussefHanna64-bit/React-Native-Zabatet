import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useWorkspace } from "../context/WorkspaceContext";
import { useBoardData } from "../features/boards/hooks/useBoardData";
import BoardSelector from "../features/boards/components/BoardSelector";

import { sprintApi, type Sprint } from "../api/sprintApi";
import SprintCard from "../features/sprints/components/SprintCard";
import CreateSprintDialog from "../features/sprints/components/CreateSprintDialog";
import EditSprintDialog from "../features/sprints/components/EditSprintDialog";

import CreateIssueDialog from "../features/backlog/components/CreateIssueDialog";
import TaskDetailsDialog from "../features/backlog/components/TaskDetailsDialog";

import { colors } from "../theme/theme";

const STATUS_ORDER: Record<string, number> = {
  active: 0,
  Active: 0,
  planned: 1,
  Planned: 1,
  completed: 2,
  Completed: 2,
};

export default function SprintsScreen() {
  const { currentWorkspace } = useWorkspace();

  const {
    workspaceMongoId,
    boards,
    selectedBoardId,
    loadingBoards,
    selectBoard,
    handleBoardCreated,
    sprints,
    loadingSprints,
    tasks,
    loadingTasks,
    issueNumbers,
    teamMembers,
    selectedTask,
    setSelectedTaskId,
    comments,
    commentsLoading,
    savingTask,
    handlePatchSelectedTask,
    handleAddComment,
    handleCreatedIssue,
  } = useBoardData(currentWorkspace?.name);

  const [localSprints, setLocalSprints] = useState<Sprint[] | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [addTaskSprintId, setAddTaskSprintId] = useState<string | null>(null);

  useEffect(() => {
    setLocalSprints(null);
  }, [selectedBoardId, sprints]);

  const effectiveSprints = (localSprints ?? (sprints as unknown as Sprint[]))
    .slice()
    .sort((a, b) => {
      const sa = STATUS_ORDER[a.status] ?? 3;
      const sb = STATUS_ORDER[b.status] ?? 3;
      return sa - sb;
    });

  const tasksForSprint = useMemo(() => {
    const map: Record<string, typeof tasks> = {};
    for (const sprint of effectiveSprints) {
      const id = (sprint._id ?? sprint.id)!;
      map[id] = tasks.filter(
        (t) => t.sprintId === id || (t.sprintId as any)?._id === id,
      );
    }
    return map;
  }, [effectiveSprints, tasks]);

  const selectedBoard = boards.find((b) => b._id === selectedBoardId) ?? null;

  const patchSprintLocally = (updated: Sprint) => {
    const id = updated._id ?? updated.id;
    setLocalSprints((prev) => {
      const base = prev ?? (sprints as unknown as Sprint[]);
      return base.map((s) =>
        (s._id ?? s.id) === id ? { ...s, ...updated } : s,
      );
    });
  };

  const removeSprintLocally = (id: string) => {
    setLocalSprints((prev) => {
      const base = prev ?? (sprints as unknown as Sprint[]);
      return base.filter((s) => (s._id ?? s.id) !== id);
    });
  };

  const handleStart = async (sprint: Sprint) => {
    const id = (sprint._id ?? sprint.id)!;
    try {
      const updated = await sprintApi.startSprint(id);
      patchSprintLocally(updated);
    } catch {}
  };

  const handleComplete = async (sprint: Sprint) => {
    const id = (sprint._id ?? sprint.id)!;
    try {
      const updated = await sprintApi.completeSprint(id);
      patchSprintLocally(updated);
    } catch {
      
    }
  };

  const handleDelete = async (sprint: Sprint) => {
    const id = (sprint._id ?? sprint.id)!;
    try {
      await sprintApi.deleteSprint(id);
      removeSprintLocally(id);
    } catch {
      
    }
  };

  return (
    <View style={styles.screen}>
      <BoardSelector
        boards={boards}
        selectedId={selectedBoardId}
        onSelect={selectBoard}
        onBoardCreated={handleBoardCreated}
        workspaceId={workspaceMongoId}
        loading={loadingBoards}
      />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.heading}>Sprints</Text>
          <Button
            mode="contained"
            icon="plus"
            compact
            disabled={!selectedBoardId}
            onPress={() => setCreateOpen(true)}
          >
            New Sprint
          </Button>
        </View>

        {loadingSprints || loadingTasks ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
        ) : !selectedBoardId ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="run-fast"
              size={52}
              color={colors.border}
            />
            <Text style={styles.emptyTitle}>No board selected</Text>
            <Text style={styles.emptySubtitle}>
              Use the board switcher above to select or create a board.
            </Text>
          </View>
        ) : effectiveSprints.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="run-fast"
              size={52}
              color={colors.border}
            />
            <Text style={styles.emptyTitle}>No sprints yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first sprint to start planning work.
            </Text>
            <Button
              mode="contained"
              icon="plus"
              onPress={() => setCreateOpen(true)}
              style={{ marginTop: 12 }}
            >
              New Sprint
            </Button>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            {effectiveSprints.map((sprint) => {
              const id = (sprint._id ?? sprint.id)!;
              return (
                <SprintCard
                  key={id}
                  sprint={sprint}
                  tasks={tasksForSprint[id] ?? []}
                  onStart={() => handleStart(sprint)}
                  onComplete={() => handleComplete(sprint)}
                  onEdit={() => setEditingSprint(sprint)}
                  onDelete={() => handleDelete(sprint)}
                  onAddTask={() => setAddTaskSprintId(id)}
                  onOpenTask={(task) => setSelectedTaskId(task._id)}
                />
              );
            })}
          </ScrollView>
        )}
      </View>

      {!!selectedBoardId && (
        <>
          <CreateSprintDialog
            visible={createOpen}
            onDismiss={() => setCreateOpen(false)}
            boardId={selectedBoardId}
            onCreated={(sprint) => {
              setLocalSprints((prev) => [
                ...(prev ?? (sprints as unknown as Sprint[])),
                sprint,
              ]);
              setCreateOpen(false);
            }}
          />

          <EditSprintDialog
            visible={!!editingSprint}
            onDismiss={() => setEditingSprint(null)}
            sprint={editingSprint}
            onUpdated={(updated) => {
              patchSprintLocally(updated);
              setEditingSprint(null);
            }}
          />

          <CreateIssueDialog
            visible={!!addTaskSprintId}
            onDismiss={() => setAddTaskSprintId(null)}
            board={selectedBoard as any}
            sprints={sprints as any}
            teamMembers={teamMembers as any}
            defaultSprintId={addTaskSprintId ?? undefined}
            onCreated={(task) => {
              handleCreatedIssue(task);
              setAddTaskSprintId(null);
            }}
          />
        </>
      )}

      <TaskDetailsDialog
        visible={Boolean(selectedTask)}
        task={selectedTask as any}
        issueKey={selectedTask ? issueNumbers[selectedTask._id] : ""}
        sprints={sprints as any}
        teamMembers={teamMembers as any}
        comments={comments}
        commentsLoading={commentsLoading}
        saving={savingTask}
        onDismiss={() => setSelectedTaskId(null)}
        onPatch={handlePatchSelectedTask as any}
        onAddComment={handleAddComment}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  heading: {
    fontWeight: "700",
    fontSize: 18,
    color: colors.textPrimary,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 60,
  },
  emptyTitle: {
    color: colors.textFaint,
    fontWeight: "600",
    fontSize: 16,
  },
  emptySubtitle: {
    color: colors.textFaint,
    fontSize: 13,
    textAlign: "center",
  },
});
