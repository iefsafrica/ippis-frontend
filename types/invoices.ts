export interface Invoice {
  id: number
  invoice_number: string
  client_id: number
  project_id: number
  issue_date: string
  due_date: string
  status: string
  total: number | string
  created_at: string
  updated_at: string
}

interface InvoicesListData {
  invoices: Invoice[]
}

export interface GetInvoicesResponse {
  success: boolean
  data: InvoicesListData
  message?: string
}

export interface GetInvoiceResponse {
  success: boolean
  data: InvoicesListData
  message?: string
}

export interface CreateInvoiceRequest {
  client_id: number
  project_id: number
  issue_date: string
  due_date: string
  status: string
  total: number
}

export interface CreateInvoiceResponse {
  success: boolean
  message: string
  data: Invoice
}

export interface UpdateInvoiceRequest {
  id?: number
  client_id?: number
  project_id?: number
  issue_date?: string
  due_date?: string
  status?: string
  total?: number
}

export interface UpdateInvoiceResponse {
  success: boolean
  message: string
  data: Invoice
}

export interface DeleteInvoiceResponse {
  success: boolean
  message: string
}
