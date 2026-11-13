import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  generatePayslips,
  getPayslipById,
  getPayslips,
  GeneratePayslipsPayload,
  PayslipDetails,
  PayslipListFilters,
} from "@/services/endpoints/payroll/payslips";

export const PAYSLIPS_QUERY_KEY = ["payroll-payslips"] as const;

export function usePayslips(filters: PayslipListFilters = {}) {
  return useQuery({
    queryKey: [...PAYSLIPS_QUERY_KEY, filters],
    queryFn: () => getPayslips(filters),
  });
}

export function usePayslipDetails(id: string | number | null, enabled: boolean) {
  return useQuery<PayslipDetails>({
    queryKey: [...PAYSLIPS_QUERY_KEY, "detail", id],
    queryFn: () => getPayslipById(id!),
    enabled: Boolean(enabled && id !== null && id !== ""),
  });
}

export function useGeneratePayslips() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GeneratePayslipsPayload) => generatePayslips(payload),
    onSuccess: (_data, variables) => {
      if (!variables.dryRun) {
        queryClient.invalidateQueries({ queryKey: PAYSLIPS_QUERY_KEY });
      }
    },
  });
}

