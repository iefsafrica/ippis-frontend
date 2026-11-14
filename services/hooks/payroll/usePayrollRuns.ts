import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPayrollRuns,
  preparePayrollRun,
  approvePayrollRun,
  rejectPayrollRun,
} from "@/services/endpoints/payroll/runs";
import { PreparePayrollRunPayload } from "@/types/payroll-runs";

export const useGetPayrollRuns = (params?: {
  company_id?: number | string;
  month?: number | string;
  year?: number | string;
}) => {
  return useQuery({
    queryKey: ["payroll-runs", params],
    queryFn: () => getPayrollRuns(params),
  });
};

export const usePreparePayrollRun = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PreparePayrollRunPayload) => preparePayrollRun(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
    },
  });
};

export const useApprovePayrollRun = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (runId: number | string) => approvePayrollRun(runId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
    },
  });
};

export const useRejectPayrollRun = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ runId, reason }: { runId: number | string; reason?: string }) =>
      rejectPayrollRun(runId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
    },
  });
};
