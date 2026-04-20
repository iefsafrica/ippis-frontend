import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  CREATE_FINANCE_DEPOSIT,
  DELETE_FINANCE_DEPOSIT,
  GET_FINANCE_DEPOSIT,
  GET_FINANCE_DEPOSITS,
  UPDATE_FINANCE_DEPOSIT,
} from "@/services/constants/finance"
import {
  createFinanceDeposit,
  deleteFinanceDeposit,
  getFinanceDeposit,
  getFinanceDeposits,
  updateFinanceDeposit,
} from "@/services/endpoints/finance/deposits"
import type {
  CreateFinanceDepositRequest,
  CreateFinanceDepositResponse,
  DeleteFinanceDepositResponse,
  GetFinanceDepositResponse,
  GetFinanceDepositsResponse,
  UpdateFinanceDepositRequest,
  UpdateFinanceDepositResponse,
} from "@/types/finance/deposits"

export const useGetFinanceDeposits = (params?: { deposit_id?: string }) => {
  return useQuery<GetFinanceDepositsResponse>({
    queryKey: [GET_FINANCE_DEPOSITS, params ?? {}],
    queryFn: () => getFinanceDeposits(params),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

export const useGetFinanceDeposit = (depositId?: string, enabled = true) => {
  return useQuery<GetFinanceDepositResponse>({
    queryKey: [GET_FINANCE_DEPOSIT, depositId],
    queryFn: () => getFinanceDeposit(depositId || ""),
    enabled: Boolean(depositId) && enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

export const useCreateFinanceDeposit = () => {
  const queryClient = useQueryClient()
  return useMutation<CreateFinanceDepositResponse, Error, CreateFinanceDepositRequest>({
    mutationKey: [CREATE_FINANCE_DEPOSIT],
    mutationFn: createFinanceDeposit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_FINANCE_DEPOSITS] })
    },
  })
}

export const useUpdateFinanceDeposit = () => {
  const queryClient = useQueryClient()
  return useMutation<UpdateFinanceDepositResponse, Error, UpdateFinanceDepositRequest>({
    mutationKey: [UPDATE_FINANCE_DEPOSIT],
    mutationFn: updateFinanceDeposit,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_FINANCE_DEPOSITS] })
      queryClient.invalidateQueries({ queryKey: [GET_FINANCE_DEPOSIT, variables.deposit_id] })
    },
  })
}

export const useDeleteFinanceDeposit = () => {
  const queryClient = useQueryClient()
  return useMutation<DeleteFinanceDepositResponse, Error, string>({
    mutationKey: [DELETE_FINANCE_DEPOSIT],
    mutationFn: deleteFinanceDeposit,
    onSuccess: (_, depositId) => {
      queryClient.invalidateQueries({ queryKey: [GET_FINANCE_DEPOSITS] })
      queryClient.invalidateQueries({ queryKey: [GET_FINANCE_DEPOSIT, depositId] })
    },
  })
}
