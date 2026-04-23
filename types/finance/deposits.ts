export interface FinanceDeposit {
  id: number
  deposit_id: string
  account_id: string
  payer_id: string
  amount: number | string
  payment_method: string
  category: string
  reference: string
  description?: string | null
  status?: string | null
  account_name?: string | null
  payer_name?: string | null
  created_at?: string
  updated_at?: string
}

interface FinanceDepositListData {
  deposits: FinanceDeposit[]
}

export interface GetFinanceDepositsResponse {
  success: boolean
  data: FinanceDepositListData
  message?: string
}

export interface GetFinanceDepositResponse {
  success: boolean
  data: FinanceDeposit
  message?: string
}

export interface CreateFinanceDepositRequest {
  account_id: string
  payer_id: string
  amount: number
  payment_method: string
  category: string
  date: string
  description?: string | null
}

export interface CreateFinanceDepositResponse {
  success: boolean
  message: string
  data: FinanceDeposit
}

export interface UpdateFinanceDepositRequest {
  deposit_id: string
  amount: number
  category: string
  status?: string
}

export interface UpdateFinanceDepositResponse {
  success: boolean
  message: string
  data: FinanceDeposit
}

export interface DeleteFinanceDepositResponse {
  success: boolean
  message: string
}
