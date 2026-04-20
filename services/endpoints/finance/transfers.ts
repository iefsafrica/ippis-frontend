import { del, get, patch, post } from "@/services/axios"
import type {
  CreateFinanceTransferRequest,
  CreateFinanceTransferResponse,
  DeleteFinanceTransferResponse,
  GetFinanceTransferResponse,
  GetFinanceTransfersResponse,
  UpdateFinanceTransferRequest,
  UpdateFinanceTransferResponse,
} from "@/types/finance/transfers"

const FINANCE_TRANSFERS_ENDPOINT = "/finance/transfers"

export const createFinanceTransfer = async (
  payload: CreateFinanceTransferRequest,
): Promise<CreateFinanceTransferResponse> => {
  return post<CreateFinanceTransferResponse>(FINANCE_TRANSFERS_ENDPOINT, payload)
}

export const getFinanceTransfers = async (params?: {
  transfer_id?: string
}): Promise<GetFinanceTransfersResponse> => {
  return get<GetFinanceTransfersResponse>(FINANCE_TRANSFERS_ENDPOINT, params)
}

export const getFinanceTransfer = async (transferId: string): Promise<GetFinanceTransferResponse> => {
  return get<GetFinanceTransferResponse>(FINANCE_TRANSFERS_ENDPOINT, {
    transfer_id: transferId,
  })
}

export const updateFinanceTransfer = async (
  payload: UpdateFinanceTransferRequest,
): Promise<UpdateFinanceTransferResponse> => {
  return patch<UpdateFinanceTransferResponse>(FINANCE_TRANSFERS_ENDPOINT, payload)
}

export const deleteFinanceTransfer = async (
  transferId: string,
): Promise<DeleteFinanceTransferResponse> => {
  return del<DeleteFinanceTransferResponse>(FINANCE_TRANSFERS_ENDPOINT, {
    transfer_id: transferId,
  })
}
