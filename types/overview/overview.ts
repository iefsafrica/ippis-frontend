export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  pendingEmployees: number;
  pendingDocuments: number;
  verifiedDocuments: number;
  rejectedDocuments: number;
}

export interface DashboardStatsResponse {
  success: boolean;
  data: DashboardStats;
}
