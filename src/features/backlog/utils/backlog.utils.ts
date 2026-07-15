
export function unwrap<T>(payload: any, fallback: T): T {
  return (payload?.data ?? payload ?? fallback) as T;
}

export function uniqueById<T extends { _id: string }>(items: T[]) {
  return Array.from(new Map(items.map((item) => [item._id, item])).values());
}
