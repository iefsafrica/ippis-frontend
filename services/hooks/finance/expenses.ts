import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  CREATE_FINANCE_EXPENSE,
  DELETE_FINANCE_EXPENSE,
  GET_FINANCE_EXPENSE,
  GET_FINANCE_EXPENSES,
  UPDATE_FINANCE_EXPENSE,
} from "@/services/constants/finance"
import {
  createFinanceExpense,
  deleteFinanceExpense,
  getFinanceExpense,
  getFinanceExpenses,
  updateFinanceExpense,
} from "@/services/endpoints/finance/expenses"
import type {
  CreateFinanceExpenseRequest,
  CreateFinanceExpenseResponse,
  DeleteFinanceExpenseResponse,
  GetFinanceExpenseResponse,
  GetFinanceExpensesResponse,
  UpdateFinanceExpenseRequest,
  UpdateFinanceExpenseResponse,
} from "@/types/finance/expenses"

export const useGetFinanceExpenses = (params?: { expense_id?: string }) => {
  return useQuery<GetFinanceExpensesResponse>({
    queryKey: [GET_FINANCE_EXPENSES, params ?? {}],
    queryFn: () => getFinanceExpenses(params),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

export const useGetFinanceExpense = (expenseId?: string, enabled = true) => {
  return useQuery<GetFinanceExpenseResponse>({
    queryKey: [GET_FINANCE_EXPENSE, expenseId],
    queryFn: () => getFinanceExpense(expenseId || ""),
    enabled: Boolean(expenseId) && enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

export const useCreateFinanceExpense = () => {
  const queryClient = useQueryClient()
  return useMutation<CreateFinanceExpenseResponse, Error, CreateFinanceExpenseRequest>({
    mutationKey: [CREATE_FINANCE_EXPENSE],
    mutationFn: createFinanceExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_FINANCE_EXPENSES] })
    },
  })
}

export const useUpdateFinanceExpense = () => {
  const queryClient = useQueryClient()
  return useMutation<UpdateFinanceExpenseResponse, Error, UpdateFinanceExpenseRequest>({
    mutationKey: [UPDATE_FINANCE_EXPENSE],
    mutationFn: updateFinanceExpense,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_FINANCE_EXPENSES] })
      queryClient.invalidateQueries({ queryKey: [GET_FINANCE_EXPENSE, variables.expense_id] })
    },
  })
}

export const useDeleteFinanceExpense = () => {
  const queryClient = useQueryClient()
  return useMutation<DeleteFinanceExpenseResponse, Error, string>({
    mutationKey: [DELETE_FINANCE_EXPENSE],
    mutationFn: deleteFinanceExpense,
    onSuccess: (_, expenseId) => {
      queryClient.invalidateQueries({ queryKey: [GET_FINANCE_EXPENSES] })
      queryClient.invalidateQueries({ queryKey: [GET_FINANCE_EXPENSE, expenseId] })
    },
  })
}
