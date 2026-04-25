import { del, get, patch, post } from "@/services/axios"
import type {
  CreateFinanceExpenseRequest,
  CreateFinanceExpenseResponse,
  DeleteFinanceExpenseResponse,
  GetFinanceExpenseResponse,
  GetFinanceExpensesResponse,
  UpdateFinanceExpenseRequest,
  UpdateFinanceExpenseResponse,
} from "@/types/finance/expenses"
import { ApprovalPayload, ApprovalResponse } from "@/types/approval"

const FINANCE_EXPENSES_ENDPOINT = "/finance/expenses"

export const createFinanceExpense = async (
  payload: CreateFinanceExpenseRequest,
): Promise<CreateFinanceExpenseResponse> => {
  return post<CreateFinanceExpenseResponse>(FINANCE_EXPENSES_ENDPOINT, payload)
}

export const getFinanceExpenses = async (params?: {
  expense_id?: string
}): Promise<GetFinanceExpensesResponse> => {
  return get<GetFinanceExpensesResponse>(FINANCE_EXPENSES_ENDPOINT, params)
}

export const getFinanceExpense = async (expenseId: string): Promise<GetFinanceExpenseResponse> => {
  return get<GetFinanceExpenseResponse>(FINANCE_EXPENSES_ENDPOINT, {
    expense_id: expenseId,
  })
}

export const updateFinanceExpense = async (
  payload: UpdateFinanceExpenseRequest,
): Promise<UpdateFinanceExpenseResponse> => {
  return patch<UpdateFinanceExpenseResponse>(FINANCE_EXPENSES_ENDPOINT, payload)
}

export const deleteFinanceExpense = async (
  expenseId: string,
): Promise<DeleteFinanceExpenseResponse> => {
  return del<DeleteFinanceExpenseResponse>(FINANCE_EXPENSES_ENDPOINT, {
    expense_id: expenseId,
  })
}

export const approveFinanceExpenses = async (
  payload: ApprovalPayload<string | number>,
): Promise<ApprovalResponse> => {
  return post<ApprovalResponse>("/finance/expenses/approve", payload)
}
