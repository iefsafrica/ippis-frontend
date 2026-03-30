export const TASK_ENDPOINTS = {
  BASE: "/task",
  CREATE: "/task",
  UPDATE: "/task",
  DELETE: "/task",
} as const

export const TASK_QUERY_KEYS = {
  base: ["tasks"] as const,
  list: () => [...TASK_QUERY_KEYS.base, "list"] as const,
  detail: (id: number | string) => [...TASK_QUERY_KEYS.base, "detail", id] as const,
  create: () => [...TASK_QUERY_KEYS.base, "create"] as const,
  update: () => [...TASK_QUERY_KEYS.base, "update"] as const,
  remove: () => [...TASK_QUERY_KEYS.base, "remove"] as const,
} as const
