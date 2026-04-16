import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  CREATE_FINANCE_PAYER,
  DELETE_FINANCE_PAYER,
  GET_FINANCE_PAYERS,
  UPDATE_FINANCE_PAYER,
} from "@/services/constants/finance"
import {
  createFinancePayer,
  deleteFinancePayer,
  getFinancePayers,
  updateFinancePayer,
} from "@/services/endpoints/finance/payers"
import type {
  CreateFinancePayerRequest,
  CreateFinancePayerResponse,
  DeleteFinancePayerResponse,
  GetFinancePayersResponse,
  UpdateFinancePayerRequest,
  UpdateFinancePayerResponse,
} from "@/types/finance/payers"

export const useGetFinancePayers = (params?: { sortBy?: string; order?: "asc" | "desc" }) => {
  return useQuery<GetFinancePayersResponse>({
    queryKey: [GET_FINANCE_PAYERS, params ?? {}],
    queryFn: () => getFinancePayers(params),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

export const useCreateFinancePayer = () => {
  const queryClient = useQueryClient()
  return useMutation<CreateFinancePayerResponse, Error, CreateFinancePayerRequest>({
    mutationKey: [CREATE_FINANCE_PAYER],
    mutationFn: createFinancePayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_FINANCE_PAYERS] })
    },
  })
}

export const useUpdateFinancePayer = () => {
  const queryClient = useQueryClient()
  return useMutation<UpdateFinancePayerResponse, Error, UpdateFinancePayerRequest>({
    mutationKey: [UPDATE_FINANCE_PAYER],
    mutationFn: updateFinancePayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_FINANCE_PAYERS] })
    },
  })
}

export const useDeleteFinancePayer = () => {
  const queryClient = useQueryClient()
  return useMutation<DeleteFinancePayerResponse, Error, string>({
    mutationKey: [DELETE_FINANCE_PAYER],
    mutationFn: deleteFinancePayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_FINANCE_PAYERS] })
    },
  })
}
