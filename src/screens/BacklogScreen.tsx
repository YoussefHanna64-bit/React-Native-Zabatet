import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Button, Menu, Text, TextInput } from "react-native-paper";
import { useWorkspace } from "../context/WorkspaceContext";
import type {
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
import BoardSelector from "../features/boards/components/BoardSelector";
import { uniqueById } from "../features/backlog/utils/backlog.utils";
import { getTaskComments } from "../features/backlog/api/backlog.api";
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
    selectBoard,
    handleBoardCreated,
  } = useBacklogData(currentWorkspace?.name);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | TaskStatus>("All");
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>(
    {},
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

  const selectedBoard = boards.find((b) => b._id === selectedBoardId) ?? null;

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
