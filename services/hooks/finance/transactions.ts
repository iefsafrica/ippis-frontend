import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  CREATE_FINANCE_TRANSACTION,
  DELETE_FINANCE_TRANSACTION,
  GET_FINANCE_TRANSACTION,
  GET_FINANCE_TRANSACTIONS,
  UPDATE_FINANCE_TRANSACTION,
} from "@/services/constants/finance"
import {
  createFinanceTransaction,
  deleteFinanceTransaction,
  getFinanceTransaction,
  getFinanceTransactions,
  updateFinanceTransaction,
} from "@/services/endpoints/finance/transactions"
import type {
  CreateFinanceTransactionRequest,
  CreateFinanceTransactionResponse,
  DeleteFinanceTransactionResponse,
  GetFinanceTransactionResponse,
  GetFinanceTransactionsResponse,
  UpdateFinanceTransactionRequest,
  UpdateFinanceTransactionResponse,
} from "@/types/finance/transactions"

export const useGetFinanceTransactions = (params?: { transaction_id?: string }) => {
  return useQuery<GetFinanceTransactionsResponse>({
    queryKey: [GET_FINANCE_TRANSACTIONS, params ?? {}],
    queryFn: () => getFinanceTransactions(params),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

export const useGetFinanceTransaction = (transactionId?: string, enabled = true) => {
  return useQuery<GetFinanceTransactionResponse>({
    queryKey: [GET_FINANCE_TRANSACTION, transactionId],
    queryFn: () => getFinanceTransaction(transactionId || ""),
    enabled: Boolean(transactionId) && enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

export const useCreateFinanceTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation<CreateFinanceTransactionResponse, Error, CreateFinanceTransactionRequest>({
    mutationKey: [CREATE_FINANCE_TRANSACTION],
    mutationFn: createFinanceTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_FINANCE_TRANSACTIONS] })
    },
  })
}

export const useUpdateFinanceTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation<UpdateFinanceTransactionResponse, Error, UpdateFinanceTransactionRequest>({
    mutationKey: [UPDATE_FINANCE_TRANSACTION],
    mutationFn: updateFinanceTransaction,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_FINANCE_TRANSACTIONS] })
      queryClient.invalidateQueries({ queryKey: [GET_FINANCE_TRANSACTION, variables.transaction_id] })
    },
  })
}

export const useDeleteFinanceTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation<DeleteFinanceTransactionResponse, Error, string>({
    mutationKey: [DELETE_FINANCE_TRANSACTION],
    mutationFn: deleteFinanceTransaction,
    onSuccess: (_, transactionId) => {
      queryClient.invalidateQueries({ queryKey: [GET_FINANCE_TRANSACTIONS] })
      queryClient.invalidateQueries({ queryKey: [GET_FINANCE_TRANSACTION, transactionId] })
    },
  })
}
