import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Chip,
  ProgressBar,
  SegmentedButtons,
  Text,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { useBoardData } from "../features/boards/hooks/useBoardData";
import api from "../api/api";
import BoardSelector from "../features/boards/components/BoardSelector";
import SprintFilter from "../features/boards/components/SprintFilter";
import KanbanColumn from "../features/boards/components/KanbanColumn";
import { COLUMN_ORDER } from "../features/boards/constants/boards.constants";
import type { TaskStatus } from "../features/boards/types/boards.types";

import CreateIssueDialog from "../features/backlog/components/CreateIssueDialog";
import TaskDetailsDialog from "../features/backlog/components/TaskDetailsDialog";

import { colors } from "../theme/theme";

export default function BoardsScreen() {
  const { currentWorkspace } = useWorkspace();
  const { user } = useAuth();

  const {
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
    setSelectedTaskId,
    comments,
    commentsLoading,
    savingTask,
    handlePatchSelectedTask,
    handleAddComment,
    handleCreatedIssue,
    moveTask,
  } = useBoardData(currentWorkspace?.name);

  const [filterMode, setFilterMode] = useState<"all" | "mine" | "unassigned">(
    "all",
  );
  const [createOpen, setCreateOpen] = useState(false);

  const filteredTasks = tasks.filter((task) => {
    const matchesAssignee =
      filterMode === "all"
        ? true
        : filterMode === "mine"
          ? (task.assignee as any)?.email === user?.email
          : !task.assignee;

    const matchesSprint = !selectedSprintId
      ? true
      : task.sprintId === selectedSprintId ||
        (task.sprintId as any)?._id === selectedSprintId;

    return matchesAssignee && matchesSprint;
  });

  const tasksByStatus = (status: TaskStatus) =>
    filteredTasks.filter((t) => t.status === status);

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "Done").length;
  const progress = totalTasks > 0 ? doneTasks / totalTasks : 0;
  const selectedBoard = boards.find((b) => b._id === selectedBoardId) ?? null;

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
        {(boardsError || workspaceError) && (
          <View style={styles.errorBanner}>
            <Text style={{ color: colors.error }}>
              {boardsError || workspaceError}
            </Text>
          </View>
        )}

        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.toolbar}
        >
          {!!selectedBoard && (
            <Text style={styles.boardName}>{selectedBoard.name}</Text>
          )}

          <View style={styles.kanbanTag}>
            <MaterialCommunityIcons
              name="view-column-outline"
              size={14}
              color={colors.primary}
            />
            <Text style={styles.kanbanTagText}>Kanban</Text>
          </View>

          <SprintFilter
            sprints={sprints}
            selectedSprintId={selectedSprintId}
            onChange={setSelectedSprintId}
            loading={loadingSprints}
          />

          <SegmentedButtons
            value={filterMode}
            onValueChange={(v) => setFilterMode(v as typeof filterMode)}
            style={styles.segmented}
            buttons={[
              { value: "all", label: "All" },
              { value: "mine", label: "Mine" },
              { value: "unassigned", label: "Unassigned" },
            ]}
          />

          <Button
            mode="contained"
            icon="plus"
            compact
            onPress={() => setCreateOpen(true)}
            disabled={!selectedBoardId}
          >
            Create Issue
          </Button>
        </ScrollView>

        
        <View style={styles.progressRow}>
          <ProgressBar
            progress={progress}
            color={colors.primary}
            style={styles.progressBar}
          />
          <Text style={styles.progressText}>
            {doneTasks}/{totalTasks} done
          </Text>
          {!!selectedSprintId && (
            <Chip
              compact
              onClose={() => setSelectedSprintId("")}
              style={styles.sprintChip}
              textStyle={styles.sprintChipText}
            >
              Sprint:{" "}
              {sprints.find((s) => s._id === selectedSprintId)?.name ?? ""}
            </Chip>
          )}
        </View>

        {!!tasksError && (
          <View style={styles.errorBanner}>
            <Text style={{ color: colors.error }}>{tasksError}</Text>
          </View>
        )}

        
        {!selectedBoardId && !loadingBoards && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="view-dashboard-outline"
              size={52}
              color={colors.border}
            />
            <Text style={styles.emptyTitle}>No board selected</Text>
            <Text style={styles.emptySubtitle}>
              Use the board switcher above to select or create a board.
            </Text>
          </View>
        )}

        
        {!!selectedBoardId && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 12 }}
          >
            {COLUMN_ORDER.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                tasks={tasksByStatus(status)}
                loadingTasks={loadingTasks}
                onCardPress={(task) => setSelectedTaskId(task._id)}
                onMoveTask={moveTask}
              />
            ))}
          </ScrollView>
        )}
      </View>

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

      <CreateIssueDialog
        visible={createOpen}
        board={selectedBoard as any}
        sprints={sprints as any}
        teamMembers={teamMembers as any}
        onDismiss={() => setCreateOpen(false)}
        onCreated={handleCreatedIssue}
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
    gap: 12,
  },
  errorBanner: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: colors.errorBg,
  },
  toolbar: {
    alignItems: "center",
    gap: 10,
    paddingBottom: 4,
  },
  boardName: {
    fontWeight: "700",
    color: colors.textPrimary,
    fontSize: 15,
  },
  kanbanTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  kanbanTagText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  segmented: {
    height: 36,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  progressText: {
    color: colors.textMuted,
    fontWeight: "600",
    fontSize: 11,
  },
  sprintChip: {
    height: 24,
    backgroundColor: colors.priorityMediumBg,
  },
  sprintChipText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.primary,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyTitle: {
    color: colors.textFaint,
    fontWeight: "600",
    fontSize: 16,
  },
  emptySubtitle: {
    color: colors.textFaint,
    fontSize: 13,
  },
});
