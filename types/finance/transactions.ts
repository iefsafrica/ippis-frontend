export interface FinanceTransaction {
  id: number
  transaction_id: string
  account_id: string
  transaction_type: string
  amount: number | string
  payment_method: string
  category: string
  reference_id: string
  description?: string | null
  status?: string | null
  account_name?: string | null
  created_at?: string
  updated_at?: string
  transaction_date?: string
}

interface FinanceTransactionListData {
  transactions: FinanceTransaction[]
}

export interface GetFinanceTransactionsResponse {
  success: boolean
  data: FinanceTransactionListData
  message?: string
}

export interface GetFinanceTransactionResponse {
  success: boolean
  data: FinanceTransaction
  message?: string
}

export interface CreateFinanceTransactionRequest {
  account_id: string
  amount: number
  payment_method: string
  category: string
  reference_id: string
  description?: string | null
  transaction_date: string
  transaction_type: string
}

export interface CreateFinanceTransactionResponse {
  success: boolean
  message: string
  data: FinanceTransaction
}

export interface UpdateFinanceTransactionRequest {
  transaction_id: string
  amount?: number
  category?: string
  description?: string | null
  payment_method?: string
  reference_id?: string
  transaction_date?: string
  transaction_type?: string
  account_id?: string
}

export interface UpdateFinanceTransactionResponse {
  success: boolean
  message: string
  data: FinanceTransaction
}

export interface DeleteFinanceTransactionResponse {
  success: boolean
  message: string
}
