// Payroll API endpoint constants
export const PAYROLL_ENDPOINTS = {
  GET_ALL: '/payroll',
  CREATE: '/payroll',
  UPDATE: '/payroll',
  DELETE: '/payroll',
} as const;

// Query keys for payroll operations
export const PAYROLL_QUERY_KEYS = {
  all: ['payroll'] as const,
  lists: () => [...PAYROLL_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [
    ...PAYROLL_QUERY_KEYS.lists(),
    { filters },
  ] as const,
  details: () => [...PAYROLL_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...PAYROLL_QUERY_KEYS.details(), id] as const,
} as const;
