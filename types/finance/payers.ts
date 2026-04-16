export interface FinancePayer {
  id: number
  payer_id: string
  payer_name: string
  contact_person: string
  email: string
  phone: string
  address: string
  account_number: string
  bank_name: string
  tax_id?: string | null
  category: string
  status: string
  created_at?: string
  updated_at?: string
  last_payment_date?: string | null
  last_payment_amount?: number | null
  notes?: string | null
}

interface FinancePayerListData {
  payers: FinancePayer[]
}

export interface GetFinancePayersResponse {
  success: boolean
  data: FinancePayerListData
  message?: string
}

export interface CreateFinancePayerRequest {
  payer_name: string
  contact_person: string
  email: string
  phone: string
  address: string
  account_number: string
  bank_name: string
  tax_id?: string | null
  category: string
  status: string
  notes?: string | null
}

export interface CreateFinancePayerResponse {
  success: boolean
  message: string
  data: FinancePayer
}

export interface UpdateFinancePayerRequest {
  payer_id: string
  payer_name?: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  account_number?: string
  bank_name?: string
  tax_id?: string | null
  category?: string
  status?: string
  notes?: string | null
}

export interface UpdateFinancePayerResponse {
  success: boolean
  message: string
  data: FinancePayer
}

export interface DeleteFinancePayerResponse {
  success: boolean
  message: string
}
