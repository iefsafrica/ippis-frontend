export interface EmployeeAnalyticsParams {
  mda_id?: number;
  department_id?: number;
  retirement_months?: number;
  date_from?: string;
  date_to?: string;
}

export interface EmployeeAnalyticsKpi {
  value: number;
  change_percentage?: number;
  trend?: "up" | "down" | "neutral" | string;
  description?: string;
  timeframe?: string;
  verified_count?: number;
  total_active?: number;
}

export interface GradeDistributionItem {
  level: string;
  min_gl?: number | null;
  max_gl?: number | null;
  count: number;
  percentage?: number;
}

export interface ZonalDistributionItem {
  name: string;
  count?: number;
  value: number;
  color?: string;
}

export interface VerificationStats {
  nin_verified: number;
  bvn_verified: number;
  dual_verified: number;
  pending_verification: number;
  unlinked_records: number;
}

export interface UpcomingRetirementSample {
  employee_id: number | string;
  ippis_no: string;
  name: string;
  mda: string;
  grade_level: string;
  date_of_birth: string;
  date_of_first_appointment: string;
  projected_retirement_date: string;
  reason: string;
}

export interface RetirementsData {
  projected_window_months: number;
  total_due: number;
  breakdown: {
    by_age_60: number;
    by_service_35: number;
    by_both: number;
  };
  upcoming_sample?: UpcomingRetirementSample[];
}

export interface RecentVerifiedItem {
  ippisNo: string;
  name: string;
  mda: string;
  cadre: string;
  ninStatus: string;
  bvnStatus: string;
  biometrics: string;
  date: string;
}

export interface EmployeeAnalyticsData {
  generated_at?: string;
  scope?: {
    mda_id?: number | null;
    department_id?: number | null;
    mda_name?: string;
  };
  kpis: {
    total_verified_personnel: EmployeeAnalyticsKpi;
    biometric_nin_integrity: EmployeeAnalyticsKpi;
    pending_enrolment_audit: EmployeeAnalyticsKpi;
    upcoming_statutory_retirements: EmployeeAnalyticsKpi;
  };
  grade_distribution: GradeDistributionItem[];
  zonal_distribution: ZonalDistributionItem[];
  verification_stats?: VerificationStats;
  retirements?: RetirementsData;
  recent_verified: RecentVerifiedItem[];
}

export interface EmployeeAnalyticsResponse {
  success: boolean;
  data: EmployeeAnalyticsData;
}

