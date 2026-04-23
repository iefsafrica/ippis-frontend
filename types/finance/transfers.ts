export interface FinanceTransfer {
  id: number
  transfer_id: string
  from_account_id: string
  to_account_id: string
  amount: number | string
  fees: number | string
  payment_mode: string
  reference_no: string
  description?: string | null
  status?: string | null
  from_account_name?: string | null
  to_account_name?: string | null
  date?: string
  created_at?: string
  updated_at?: string
}

interface FinanceTransferListData {
  transfers: FinanceTransfer[]
}

export interface GetFinanceTransfersResponse {
  success: boolean
  data: FinanceTransferListData
  message?: string
}

export interface GetFinanceTransferResponse {
  success: boolean
  data: FinanceTransfer
  message?: string
}

export interface CreateFinanceTransferRequest {
  from_account_id: string
  to_account_id: string
  amount: number
  fees: number
  payment_mode: string
  reference_no: string
  description?: string | null
}

export interface CreateFinanceTransferResponse {
  success: boolean
  message: string
  data: FinanceTransfer
}

export interface UpdateFinanceTransferRequest {
  transfer_id: string
  amount?: number
  fees?: number
  description?: string | null
  status?: string
}

export interface UpdateFinanceTransferResponse {
  success: boolean
  message: string
  data: FinanceTransfer
}

export interface DeleteFinanceTransferResponse {
  success: boolean
  message: string
}
