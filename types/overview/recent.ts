export interface RecentActivity {
  id: string;
  name: string;
  type: string;
  created_at: string;
}

export interface RecentActivitiesResponse {
  success: boolean;
  data: RecentActivity[];
}
