export const TRANSFER_QUERY_KEYS = {

  TRANSFERS: "transfers",
  TRANSFER: "transfer",
  PENDING_TRANSFERS: "pending-transfers",
  
  TRANSFERS_BY_EMPLOYEE: "transfers-by-employee",
  TRANSFERS_BY_DEPARTMENT: "transfers-by-department",
  TRANSFERS_BY_STATUS: "transfers-by-status",
  
  TRANSFER_STATS: "transfer-stats",
  TRANSFER_TIMELINE: "transfer-timeline",
} as const;

export const TRANSFERS = TRANSFER_QUERY_KEYS.TRANSFERS;
export const TRANSFER = TRANSFER_QUERY_KEYS.TRANSFER;
export const PENDING_TRANSFERS = TRANSFER_QUERY_KEYS.PENDING_TRANSFERS;