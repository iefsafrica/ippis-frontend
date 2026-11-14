import { get, post, del } from "@/services/axios";
import {
  GetPayrollRunsResponse,
  PayrollRunResponse,
  PreparePayrollRunPayload,
  ApprovePayrollRunResponse,
  RejectPayrollRunResponse,
} from "@/types/payroll-runs";

/**
 * Get payroll runs (optionally filter by MDA company_id, month, year)
 */
export const getPayrollRuns = async (params?: {
  company_id?: number | string;
  month?: number | string;
  year?: number | string;
}): Promise<GetPayrollRunsResponse> => {
  return get<GetPayrollRunsResponse>("/payroll/runs", params);
};

/**
 * Prepare a month's payroll for one MDA
 */
export const preparePayrollRun = async (
  payload: PreparePayrollRunPayload
): Promise<PayrollRunResponse> => {
  return post<PayrollRunResponse>("/payroll/runs", payload);
};

/**
 * Approve a payroll run (must be a different person than preparer)
 */
export const approvePayrollRun = async (
  runId: number | string
): Promise<ApprovePayrollRunResponse> => {
  return post<ApprovePayrollRunResponse>(`/payroll/runs/${runId}/approve`, {});
};

/**
 * Reject a payroll run (deletes draft records so it can be prepared again)
 */
export const rejectPayrollRun = async (
  runId: number | string,
  reason?: string
): Promise<RejectPayrollRunResponse> => {
  return post<RejectPayrollRunResponse>(`/payroll/runs/${runId}/reject`, { reason });
};
