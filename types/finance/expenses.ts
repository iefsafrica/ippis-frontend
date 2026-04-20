export interface FinanceExpense {
  id: number
  expense_id: string
  account_id: string
  payee_id: string
  amount: number | string
  payment_method: string
  category: string
  reference: string
  description?: string | null
  status?: string | null
  account_name?: string | null
  payee_name?: string | null
  created_at?: string
  updated_at?: string
  date?: string
}

interface FinanceExpenseListData {
  expenses: FinanceExpense[]
}

export interface GetFinanceExpensesResponse {
  success: boolean
  data: FinanceExpenseListData
  message?: string
}

export interface GetFinanceExpenseResponse {
  success: boolean
  data: FinanceExpense
  message?: string
}

export interface CreateFinanceExpenseRequest {
  account_id: string
  payee_id: string
  amount: number
  payment_method: string
  category: string
  date?: string
  description?: string | null
}

export interface CreateFinanceExpenseResponse {
  success: boolean
  message: string
  data: FinanceExpense
}

export interface UpdateFinanceExpenseRequest {
  expense_id: string
  amount?: number
  category?: string
  description?: string | null
  account_id?: string
  payee_id?: string
  payment_method?: string
  date?: string
}

export interface UpdateFinanceExpenseResponse {
  success: boolean
  message: string
  data: FinanceExpense
}

export interface DeleteFinanceExpenseResponse {
  success: boolean
  message: string
}
