export type PayrollRunStatus = "draft" | "approved" | "rejected";

export interface SkippedEmployee {
  employee_id: string | number;
  name: string;
  department?: string;
  reason: string;
}

export interface PayrollRun {
  id: number | string;
  company_id: number | string;
  company_name: string;
  month: number | string;
  year: number | string;
  status: PayrollRunStatus;
  total_employees: number;
  total_gross: number;
  total_deductions: number;
  total_net: number;
  prepared_by: number | string;
  prepared_by_name?: string;
  approved_by?: number | string;
  approved_by_name?: string;
  rejected_by?: number | string;
  rejected_by_name?: string;
  created_at: string;
  approved_at?: string;
  rejected_at?: string;
  skipped_employees?: SkippedEmployee[];
}

export interface PreparePayrollRunPayload {
  company_id: number | string;
  month: number | string;
  year: number | string;
}

export interface GetPayrollRunsResponse {
  success: boolean;
  data: PayrollRun[];
  message?: string;
}

export interface PayrollRunResponse {
  success: boolean;
  data: PayrollRun;
  message?: string;
}

export interface ApprovePayrollRunResponse {
  success: boolean;
  message: string;
  data?: PayrollRun;
}

export interface RejectPayrollRunResponse {
  success: boolean;
  message: string;
}
