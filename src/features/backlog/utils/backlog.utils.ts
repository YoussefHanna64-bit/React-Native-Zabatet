import { TaskDoc } from "../types/backlog.types";

export function unwrap<T>(payload: any, fallback: T): T {
  return (payload?.data ?? payload ?? fallback) as T;
}

export function uniqueById<T extends { _id: string }>(items: T[]) {
  return Array.from(new Map(items.map((item) => [item._id, item])).values());
}

export function getApiError(error: any, fallback: string) {
  return error?.response?.data?.message ?? error?.message ?? fallback;
}

export function getSprintId(task: TaskDoc) {
  if (!task.sprintId) return null;
  return typeof task.sprintId === "string" ? task.sprintId : task.sprintId._id;
}

export function getAssigneeId(task: TaskDoc) {
  if (!task.assignee) return "";
  return typeof task.assignee === "string" ? task.assignee : task.assignee._id;
}

export function getAssigneeName(task: TaskDoc) {
  if (!task.assignee) return "Unassigned";
  return typeof task.assignee === "string" ? "Assigned" : task.assignee.name;
}
