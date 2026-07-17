import { useMemo, type ReactNode } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Chip,
  IconButton,
  Text,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import {
  useDashboardData,
  STATUS_COLORS,
  PRIORITY_COLORS,
  STATUS_ORDER,
  PRIORITY_ORDER,
  avatarColor,
  getInitials,
  type Priority,
} from "../api/DashboardAPI";
import { colors } from "../theme/theme";

function Card({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const KPI_CONFIG = [
  {
    key: "totalTasks",
    label: "Total Tasks",
    icon: "clipboard-text-outline" as const,
    accent: "#7C4DFF",
  },
  {
    key: "totalBoards",
    label: "Boards",
    icon: "view-column-outline" as const,
    accent: "#009688",
  },
  {
    key: "activeSprints",
    label: "Active Sprints",
    icon: "lightning-bolt-outline" as const,
    accent: "#FF9800",
  },
  {
    key: "totalStoryPoints",
    label: "Story Points",
    icon: "star-outline" as const,
    accent: "#E91E63",
  },
  {
    key: "completedTasks",
    label: "Completed Tasks",
    icon: "check-circle-outline" as const,
    accent: "#4CAF50",
  },
];

function KPICardGrid({ kpis }: { kpis: Record<string, number> }) {
  return (
    <View style={styles.kpiGrid}>
      {KPI_CONFIG.map(({ key, label, icon, accent }) => (
        <Card key={key} style={styles.kpiCard}>
          <View
            style={[styles.kpiIconWrap, { backgroundColor: `${accent}18` }]}
          >
            <MaterialCommunityIcons name={icon} size={18} color={accent} />
          </View>
          <Text style={styles.kpiValue}>{kpis[key] ?? 0}</Text>
          <Text style={styles.kpiLabel}>{label}</Text>
        </Card>
      ))}
    </View>
  );
}

function DistributionCard({
  title,
  items,
  total,
}: {
  title: string;
  total: number;
  items: { label: string; count: number; color: string; bg?: string }[];
}) {
  const barItems = items.filter((i) => i.count > 0);
  return (
    <Card style={{ flex: 1 }}>
      <Text style={styles.cardTitle}>{title}</Text>
      {total === 0 ? (
        <Text style={styles.emptyText}>No tasks</Text>
      ) : (
        <>
          <View style={styles.segmentBar}>
            {barItems.map((it) => (
              <View
                key={it.label}
                style={{ flex: it.count, backgroundColor: it.color }}
              />
            ))}
          </View>
          <View style={{ gap: 8, marginTop: 12 }}>
            {items.map((it) => (
              <View key={it.label} style={styles.legendRow}>
                <View style={styles.legendLabelRow}>
                  <View
                    style={[styles.legendDot, { backgroundColor: it.color }]}
                  />
                  <Text style={styles.legendLabel}>{it.label}</Text>
                </View>
                <Chip
                  compact
                  style={{ backgroundColor: it.bg ?? `${it.color}18` }}
                  textStyle={{
                    fontSize: 10,
                    fontWeight: "700",
                    color: it.color,
                  }}
                >
                  {it.count}
                </Chip>
              </View>
            ))}
          </View>
        </>
      )}
    </Card>
  );
}

function ActiveSprintsCard({
  sprints,
}: {
  sprints: Array<{
    _id: string;
    name: string;
    goal?: string;
    totalTasks: number;
    doneTasks: number;
    totalPts: number;
    donePts: number;
  }>;
}) {
  return (
    <Card>
      <View style={styles.cardHeaderRow}>
        <MaterialCommunityIcons
          name="lightning-bolt-outline"
          size={16}
          color={colors.primary}
        />
        <Text style={styles.cardTitle}>Active Sprints</Text>
        <Chip compact style={styles.countChip} textStyle={styles.countChipText}>
          {sprints.length}
        </Chip>
      </View>
      {sprints.length === 0 ? (
        <View style={styles.emptyBlock}>
          <MaterialCommunityIcons
            name="lightning-bolt-outline"
            size={32}
            color={colors.border}
          />
          <Text style={styles.emptyText}>No active sprints</Text>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {sprints.map((s) => (
            <View key={s._id} style={styles.subCard}>
              <Text style={styles.subCardTitle}>{s.name}</Text>
              {!!s.goal && (
                <Text style={styles.subCardText} numberOfLines={2}>
                  {s.goal}
                </Text>
              )}
              <View style={styles.rowGap16}>
                <Text style={styles.statText}>
                  <Text style={{ fontWeight: "700", color: colors.success }}>
                    {s.doneTasks}
                  </Text>
                  /{s.totalTasks} tasks done
                </Text>
                <Text style={styles.statText}>
                  <Text style={{ fontWeight: "700", color: colors.primary }}>
                    {s.donePts}
                  </Text>
                  /{s.totalPts} pts achieved
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

function BoardsOverviewCard({
  boardStats,
}: {
  boardStats: Array<{
    _id: string;
    name: string;
    taskCount: number;
    pct: number;
  }>;
}) {
  return (
    <Card>
      <Text style={styles.cardTitle}>Boards Overview</Text>
      {boardStats.length === 0 ? (
        <View style={styles.emptyBlock}>
          <MaterialCommunityIcons
            name="view-column-outline"
            size={32}
            color={colors.border}
          />
          <Text style={styles.emptyText}>No boards yet</Text>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {boardStats.map((b) => (
            <View key={b._id} style={styles.subCard}>
              <Text style={styles.subCardTitle} numberOfLines={1}>
                {b.name}
              </Text>
              <Text style={styles.subCardMeta}>
                {b.taskCount} tasks ·{" "}
                <Text style={{ color: colors.success, fontWeight: "700" }}>
                  {b.pct}% done
                </Text>
              </Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

function UpcomingDeadlinesCard({
  deadlines,
}: {
  deadlines: Array<{
    _id: string;
    title: string;
    priority: Priority;
    dueDate?: string;
    diffDays: number;
    boardName: string;
    assignee?: { _id: string; name: string };
  }>;
}) {
  return (
    <Card>
      <Text style={styles.cardTitle}>Upcoming Deadlines</Text>
      {deadlines.length === 0 ? (
        <View style={styles.emptyBlock}>
          <MaterialCommunityIcons
            name="calendar-blank-outline"
            size={32}
            color={colors.border}
          />
          <Text style={styles.emptyText}>No upcoming deadlines</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10 }}
        >
          {deadlines.map((t) => {
            const uc =
              t.diffDays < 0
                ? "#F44336"
                : t.diffDays === 0
                  ? "#FF9800"
                  : t.diffDays <= 2
                    ? "#FFC107"
                    : "#9E9E9E";
            const ul =
              t.diffDays < 0
                ? "Overdue"
                : t.diffDays === 0
                  ? "Today"
                  : t.diffDays === 1
                    ? "Tomorrow"
                    : `${t.diffDays}d`;
            const pCfg = PRIORITY_COLORS[t.priority] ?? {
              color: "#9E9E9E",
              bg: "#F5F5F5",
            };
            return (
              <View key={t._id} style={styles.deadlineCard}>
                <View style={styles.rowBetween}>
                  <Chip
                    compact
                    style={{ backgroundColor: pCfg.bg }}
                    textStyle={{
                      fontSize: 10,
                      fontWeight: "700",
                      color: pCfg.color,
                    }}
                  >
                    {t.priority}
                  </Chip>
                  <Chip
                    compact
                    style={{ backgroundColor: `${uc}18` }}
                    textStyle={{ fontSize: 10, fontWeight: "700", color: uc }}
                  >
                    {ul}
                  </Chip>
                </View>
                <Text style={styles.deadlineTitle} numberOfLines={2}>
                  {t.title}
                </Text>
                {!!t.boardName && (
                  <Text style={styles.deadlineBoard}>{t.boardName}</Text>
                )}
                <View style={styles.rowBetween}>
                  <Text style={styles.deadlineDate}>
                    {t.dueDate
                      ? new Date(t.dueDate).toDateString().slice(4, 10)
                      : ""}
                  </Text>
                  {t.assignee ? (
                    <Avatar.Text
                      size={20}
                      label={getInitials(t.assignee.name)}
                      style={{ backgroundColor: avatarColor(t.assignee.name) }}
                      labelStyle={{ fontSize: 8 }}
                    />
                  ) : (
                    <Avatar.Text
                      size={20}
                      label="?"
                      style={{ backgroundColor: "#E0E0E0" }}
                      labelStyle={{ fontSize: 8 }}
                    />
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </Card>
  );
}
export default function DashboardScreen() {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const {
    loading,
    error,
    kpis,
    statusCounts,
    priorityCounts,
    activeSprintsList,
    boardStats,
    upcomingDeadlines,
    refresh,
  } = useDashboardData(currentWorkspace?.name);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const statusItems = STATUS_ORDER.map((s) => ({
    label: s,
    count: statusCounts[s],
    color: STATUS_COLORS[s],
  }));
  const priorityItems = PRIORITY_ORDER.map((p) => ({
    label: p,
    count: priorityCounts[p],
    color: PRIORITY_COLORS[p].color,
    bg: PRIORITY_COLORS[p].bg,
  }));

  if (loading && kpis.totalTasks === 0) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refresh}
          colors={[colors.primary]}
        />
      }
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>
            {greeting}, {user?.name?.split(" ")[0] ?? "there"}
          </Text>
          <View style={styles.workspaceRow}>
            <Text style={styles.workspaceLabel}>Workspace:</Text>
            <Chip
              compact
              style={{ backgroundColor: colors.priorityMediumBg }}
              textStyle={{
                fontSize: 11,
                fontWeight: "600",
                color: colors.primary,
              }}
            >
              {currentWorkspace?.name ?? ""}
            </Chip>
          </View>
        </View>
        <IconButton
          icon="refresh"
          mode="outlined"
          size={18}
          onPress={refresh}
        />
      </View>

      {!!error && (
        <View style={styles.errorBanner}>
          <Text style={{ color: colors.error }}>{error}</Text>
        </View>
      )}

      <KPICardGrid kpis={kpis} />

      <View style={styles.twoCol}>
        <DistributionCard
          title="Tasks by Status"
          items={statusItems}
          total={kpis.totalTasks}
        />
        <DistributionCard
          title="Tasks by Priority"
          items={priorityItems}
          total={kpis.totalTasks}
        />
      </View>

      <BoardsOverviewCard boardStats={boardStats} />
      <ActiveSprintsCard sprints={activeSprintsList} />
      <UpcomingDeadlinesCard deadlines={upcomingDeadlines} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  greeting: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  workspaceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  workspaceLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  errorBanner: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.errorBg,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardTitle: {
    fontWeight: "700",
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  kpiCard: {
    width: "47%",
    padding: 14,
  },
  kpiIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  kpiLabel: {
    color: colors.textMuted,
    fontWeight: "500",
    fontSize: 11,
    marginTop: 2,
  },
  twoCol: {
    flexDirection: "row",
    gap: 12,
  },
  segmentBar: {
    flexDirection: "row",
    height: 10,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: colors.border,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  legendLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 12,
    color: "#424242",
    fontWeight: "500",
  },
  emptyText: {
    color: colors.textFaint,
    textAlign: "center",
    fontSize: 13,
  },
  emptyBlock: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 4,
  },
  countChip: {
    backgroundColor: colors.priorityMediumBg,
  },
  countChipText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.primary,
  },
  subCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    padding: 12,
  },
  subCardTitle: {
    fontWeight: "600",
    color: colors.textPrimary,
    fontSize: 13,
    marginBottom: 4,
  },
  subCardText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 8,
  },
  subCardMeta: {
    color: colors.textMuted,
    fontSize: 11,
  },
  rowGap16: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  statText: {
    color: "#424242",
    fontSize: 11,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  deadlineCard: {
    width: 190,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    gap: 8,
  },
  deadlineTitle: {
    fontWeight: "600",
    fontSize: 12.5,
    color: colors.textPrimary,
  },
  deadlineBoard: {
    color: colors.textMuted,
    fontSize: 10.5,
  },
  deadlineDate: {
    color: colors.textFaint,
    fontSize: 10.5,
  },
});
