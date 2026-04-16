export interface FinancePayee {
  id: number
  payee_id: string
  payee_name: string
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

interface FinancePayeeListData {
  payees: FinancePayee[]
}

export interface GetFinancePayeesResponse {
  success: boolean
  data: FinancePayeeListData
  message?: string
}

export interface CreateFinancePayeeRequest {
  payee_name: string
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

export interface CreateFinancePayeeResponse {
  success: boolean
  message: string
  data: FinancePayee
}

export interface UpdateFinancePayeeRequest {
  payee_id: string
  payee_name?: string
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

export interface UpdateFinancePayeeResponse {
  success: boolean
  message: string
  data: FinancePayee
}

export interface DeleteFinancePayeeResponse {
  success: boolean
  message: string
}
