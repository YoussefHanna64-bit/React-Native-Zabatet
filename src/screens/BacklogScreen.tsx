import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { useWorkspace } from "../context/WorkspaceContext";
import type {
  BoardDoc,
  TaskDoc,
} from "../features/backlog/types/backlog.types";
import {
  line,
  muted,
  purple,
  text as textColor,
} from "../features/backlog/constants/backlog.constants";
import BoardSelector from "../features/boards/components/BoardSelector";
import {
  getBoardsForWorkspace,
  getTasksByBoard,
} from "../features/backlog/api/backlog.api";

const BacklogScreen = () => {
  const { currentWorkspace } = useWorkspace();

  const [boards, setBoards] = useState<BoardDoc[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentWorkspace) {
      return;
    }

    setLoading(true);

    getBoardsForWorkspace(currentWorkspace._id)
      .then((fetched) => {
        setBoards(fetched);

        if (fetched.length > 0) {
          setSelectedBoardId(fetched[0]._id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentWorkspace]);

  useEffect(() => {
    if (!selectedBoardId) {
      return;
    }

    getTasksByBoard(selectedBoardId)
      .then(setTasks)
      .catch(() => {});
  }, [selectedBoardId]);

  const handleCreateIssue = () => {};

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
        onSelect={setSelectedBoardId}
        onBoardCreated={(board) => {
          setBoards((prev) => [...prev, board]);
          setSelectedBoardId(board._id);
        }}
        workspaceId={currentWorkspace?._id ?? null}
        loading={loading}
      />

      <View style={styles.body}>
        <View style={styles.toolbar}>
          <TextInput
            mode="outlined"
            placeholder="Search backlog..."
            dense
            left={<TextInput.Icon icon="magnify" />}
            style={styles.searchInput}
          />
          <Button
            mode="contained"
            icon="plus"
            onPress={handleCreateIssue}
            compact
          >
            Create Issue
          </Button>
        </View>

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
                Create your first issue to get started.
              </Text>
              <Button
                mode="contained"
                icon="plus"
                onPress={handleCreateIssue}
                style={{ marginTop: 12 }}
              >
                Create Issue
              </Button>
            </View>
          ) : (
            tasks.map((task) => (
              <View key={task._id} style={styles.taskRow}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                {task.priority && (
                  <Text style={styles.taskPriority}>{task.priority}</Text>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default BacklogScreen;

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
  taskRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: line,
  },
  taskTitle: {
    color: textColor,
    fontWeight: "600",
    fontSize: 14,
    flex: 1,
  },
  taskPriority: {
    color: muted,
    fontSize: 11,
    fontWeight: "500",
    marginLeft: 8,
  },
});
