import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  CREATE_FINANCE_ACCOUNT,
  DELETE_FINANCE_ACCOUNT,
  GET_FINANCE_ACCOUNT_ANALYTICS,
  GET_FINANCE_ACCOUNTS,
  UPDATE_FINANCE_ACCOUNT,
} from "@/services/constants/finance"
import {
  createFinanceAccount,
  deleteFinanceAccount,
  getFinanceAccountAnalytics,
  getFinanceAccounts,
  updateFinanceAccount,
} from "@/services/endpoints/finance/accounts"
import type {
    CreateFinanceAccountRequest,
    CreateFinanceAccountResponse,
    DeleteFinanceAccountResponse,
    GetFinanceAccountAnalyticsResponse,
    GetFinanceAccountsResponse,
    UpdateFinanceAccountRequest,
    UpdateFinanceAccountResponse,
} from "@/types/finance/accounts"

export const useGetFinanceAccounts = () => {
  return useQuery<GetFinanceAccountsResponse>({
    queryKey: [GET_FINANCE_ACCOUNTS],
    queryFn: getFinanceAccounts,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

export const useGetFinanceAccountAnalytics = () => {
  return useQuery<GetFinanceAccountAnalyticsResponse>({
    queryKey: [GET_FINANCE_ACCOUNT_ANALYTICS],
    queryFn: getFinanceAccountAnalytics,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

export const useCreateFinanceAccount = () => {
  const queryClient = useQueryClient()
  return useMutation<CreateFinanceAccountResponse, Error, CreateFinanceAccountRequest>({
    mutationKey: [CREATE_FINANCE_ACCOUNT],
    mutationFn: createFinanceAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_FINANCE_ACCOUNTS] })
    },
  })
}

export const useUpdateFinanceAccount = () => {
  const queryClient = useQueryClient()
  return useMutation<UpdateFinanceAccountResponse, Error, UpdateFinanceAccountRequest>({
    mutationKey: [UPDATE_FINANCE_ACCOUNT],
    mutationFn: updateFinanceAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_FINANCE_ACCOUNTS] })
    },
  })
}

export const useDeleteFinanceAccount = () => {
  const queryClient = useQueryClient()
  return useMutation<DeleteFinanceAccountResponse, Error, string>({
    mutationKey: [DELETE_FINANCE_ACCOUNT],
    mutationFn: deleteFinanceAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_FINANCE_ACCOUNTS] })
    },
  })
}
