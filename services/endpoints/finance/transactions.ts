import { del, get, patch, post } from "@/services/axios"
import type {
  CreateFinanceTransactionRequest,
  CreateFinanceTransactionResponse,
  DeleteFinanceTransactionResponse,
  GetFinanceTransactionResponse,
  GetFinanceTransactionsResponse,
  UpdateFinanceTransactionRequest,
  UpdateFinanceTransactionResponse,
} from "@/types/finance/transactions"

const FINANCE_TRANSACTIONS_ENDPOINT = "/finance/transactions"

export const createFinanceTransaction = async (
  payload: CreateFinanceTransactionRequest,
): Promise<CreateFinanceTransactionResponse> => {
  return post<CreateFinanceTransactionResponse>(FINANCE_TRANSACTIONS_ENDPOINT, payload)
}

export const getFinanceTransactions = async (params?: {
  transaction_id?: string
}): Promise<GetFinanceTransactionsResponse> => {
  return get<GetFinanceTransactionsResponse>(FINANCE_TRANSACTIONS_ENDPOINT, params)
}

export const getFinanceTransaction = async (transactionId: string): Promise<GetFinanceTransactionResponse> => {
  return get<GetFinanceTransactionResponse>(FINANCE_TRANSACTIONS_ENDPOINT, {
    transaction_id: transactionId,
  })
}

export const updateFinanceTransaction = async (
  payload: UpdateFinanceTransactionRequest,
): Promise<UpdateFinanceTransactionResponse> => {
  return patch<UpdateFinanceTransactionResponse>(FINANCE_TRANSACTIONS_ENDPOINT, payload)
}

export const deleteFinanceTransaction = async (
  transactionId: string,
): Promise<DeleteFinanceTransactionResponse> => {
  return del<DeleteFinanceTransactionResponse>(FINANCE_TRANSACTIONS_ENDPOINT, {
    transaction_id: transactionId,
  })
}
