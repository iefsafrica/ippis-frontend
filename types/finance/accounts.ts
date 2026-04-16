export interface FinanceAccount {
  id: number
  account_id: string
  account_name: string
  account_number: string
  bank_name: string
  account_type: string
  currency: string
  balance: number
  opening_date?: string | null
  status?: string | null
  branch_code?: string | null
  swift_code?: string | null
  description?: string | null
  created_at?: string
  updated_at?: string
}

interface FinanceAccountListData {
  accounts: FinanceAccount[]
}

export interface GetFinanceAccountsResponse {
  success: boolean
  data: FinanceAccountListData
  message?: string
}

export interface FinanceAccountAnalyticsSummary {
  totalBalance: number
  previousBalance: number
  change: number
  percentChange: number
  increaseAccounts: number
  decreaseAccounts: number
  totalAccounts: number
}

export interface FinanceAccountAnalyticsTrendPoint {
  date?: string
  label?: string
  balance?: number
  previousBalance?: number
  change?: number
  percentChange?: number
}

export interface FinanceAccountAnalyticsDetail {
  id?: number | string
  accountName?: string
  account_name?: string
  accountNumber?: string
  account_number?: string
  bankName?: string
  bank_name?: string
  currency?: string
  currentBalance?: number
  current_balance?: number
  previousBalance?: number
  previous_balance?: number
  change?: number
  changePercentage?: number
  change_percentage?: number
  lastUpdated?: string
  last_updated?: string
}

export interface GetFinanceAccountAnalyticsResponse {
  success: boolean
  data: {
    summary: FinanceAccountAnalyticsSummary
    trend: FinanceAccountAnalyticsTrendPoint[]
    accountDetails: FinanceAccountAnalyticsDetail[]
  }
  message?: string
}

export interface CreateFinanceAccountRequest {
  account_name: string
  account_number: string
  bank_name: string
  account_type: string
  currency: string
  balance: number
  opening_date?: string
  status?: string
  branch_code?: string
  swift_code?: string
  description?: string
}

export interface CreateFinanceAccountResponse {
  success: boolean
  message: string
  data: FinanceAccount
}

export interface UpdateFinanceAccountRequest {
  account_id: string
  account_name?: string
  account_number?: string
  bank_name?: string
  account_type?: string
  currency?: string
  balance?: number
  opening_date?: string | null
  status?: string
  branch_code?: string | null
  swift_code?: string | null
  description?: string | null
}

export interface UpdateFinanceAccountResponse {
  success: boolean
  message: string
  data: FinanceAccount
}

export interface DeleteFinanceAccountResponse {
  success: boolean
  message: string
}
