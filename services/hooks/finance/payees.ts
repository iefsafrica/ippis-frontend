import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  CREATE_FINANCE_PAYEE,
  DELETE_FINANCE_PAYEE,
  GET_FINANCE_PAYEES,
  UPDATE_FINANCE_PAYEE,
} from "@/services/constants/finance"
import {
  createFinancePayee,
  deleteFinancePayee,
  getFinancePayees,
  updateFinancePayee,
} from "@/services/endpoints/finance/payees"
import type {
  CreateFinancePayeeRequest,
  CreateFinancePayeeResponse,
  DeleteFinancePayeeResponse,
  GetFinancePayeesResponse,
  UpdateFinancePayeeRequest,
  UpdateFinancePayeeResponse,
} from "@/types/finance/payees"

export const useGetFinancePayees = (params?: { sortBy?: string; order?: "asc" | "desc" }) => {
  return useQuery<GetFinancePayeesResponse>({
    queryKey: [GET_FINANCE_PAYEES, params ?? {}],
    queryFn: () => getFinancePayees(params),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

export const useCreateFinancePayee = () => {
  const queryClient = useQueryClient()
  return useMutation<CreateFinancePayeeResponse, Error, CreateFinancePayeeRequest>({
    mutationKey: [CREATE_FINANCE_PAYEE],
    mutationFn: createFinancePayee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_FINANCE_PAYEES] })
    },
  })
}

export const useUpdateFinancePayee = () => {
  const queryClient = useQueryClient()
  return useMutation<UpdateFinancePayeeResponse, Error, UpdateFinancePayeeRequest>({
    mutationKey: [UPDATE_FINANCE_PAYEE],
    mutationFn: updateFinancePayee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_FINANCE_PAYEES] })
    },
  })
}

export const useDeleteFinancePayee = () => {
  const queryClient = useQueryClient()
  return useMutation<DeleteFinancePayeeResponse, Error, string>({
    mutationKey: [DELETE_FINANCE_PAYEE],
    mutationFn: deleteFinancePayee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_FINANCE_PAYEES] })
    },
  })
}
