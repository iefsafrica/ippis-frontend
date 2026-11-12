import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getEmployeeLeaves,
  getEmployeeLeaveBalances,
  applyForLeave,
  cancelLeave,
} from "@/services/endpoints/employee/leave";
import type {
  EmployeeLeaveRequest,
  LeaveBalanceItem,
  ApplyLeavePayload,
} from "@/types/employee/leave";

export const EMPLOYEE_LEAVE_QUERY_KEYS = {
  OWN_LEAVES: "employee-own-leaves",
  BALANCES: "employee-leave-balances",
} as const;

export const useEmployeeLeaves = (status?: string) => {
  return useQuery<EmployeeLeaveRequest[], Error>({
    queryKey: [EMPLOYEE_LEAVE_QUERY_KEYS.OWN_LEAVES, status || "all"],
    queryFn: () => getEmployeeLeaves(status),
  });
};

export const useEmployeeLeaveBalances = (year?: number) => {
  return useQuery<LeaveBalanceItem[], Error>({
    queryKey: [EMPLOYEE_LEAVE_QUERY_KEYS.BALANCES, year || new Date().getFullYear()],
    queryFn: () => getEmployeeLeaveBalances(year),
  });
};

export const useApplyLeave = () => {
  const queryClient = useQueryClient();

  return useMutation<EmployeeLeaveRequest, Error, ApplyLeavePayload>({
    mutationFn: applyForLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEE_LEAVE_QUERY_KEYS.OWN_LEAVES] });
      queryClient.invalidateQueries({ queryKey: [EMPLOYEE_LEAVE_QUERY_KEYS.BALANCES] });
      queryClient.invalidateQueries({ queryKey: ["leaves-list"] });
    },
  });
};

export const useCancelLeave = () => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, number | string>({
    mutationFn: cancelLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEE_LEAVE_QUERY_KEYS.OWN_LEAVES] });
      queryClient.invalidateQueries({ queryKey: [EMPLOYEE_LEAVE_QUERY_KEYS.BALANCES] });
      queryClient.invalidateQueries({ queryKey: ["leaves-list"] });
    },
  });
};
