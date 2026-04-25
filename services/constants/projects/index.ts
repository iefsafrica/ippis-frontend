export const PROJECT_ENDPOINTS = {
  BASE: "/projects",
  CREATE: "/projects",
  UPDATE: "/projects",
  DELETE: "/projects",
  APPROVE: "/projects/approve",
} as const

export const PROJECT_QUERY_KEYS = {
  base: ["projects"] as const,
  list: () => [...PROJECT_QUERY_KEYS.base, "list"] as const,
  detail: (id: number | string) => [...PROJECT_QUERY_KEYS.base, "detail", id] as const,
  create: () => [...PROJECT_QUERY_KEYS.base, "create"] as const,
  update: () => [...PROJECT_QUERY_KEYS.base, "update"] as const,
  remove: () => [...PROJECT_QUERY_KEYS.base, "remove"] as const,
} as const
