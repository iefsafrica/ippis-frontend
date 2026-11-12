export interface MonthlyTrendItem {
  month: string;
  employees: number;
  documents: number;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  pendingEmployees: number;
  pendingDocuments: number;
  verifiedDocuments: number;
  rejectedDocuments: number;
  monthlyTrends?: MonthlyTrendItem[];
}

export interface DashboardStatsResponse {
  success: boolean;
  data: DashboardStats;
}
