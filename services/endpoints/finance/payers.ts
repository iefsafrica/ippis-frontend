import { del, get, patch, post } from "@/services/axios"
import type {
  CreateFinancePayerRequest,
  CreateFinancePayerResponse,
  DeleteFinancePayerResponse,
  GetFinancePayersResponse,
  UpdateFinancePayerRequest,
  UpdateFinancePayerResponse,
} from "@/types/finance/payers"

const FINANCE_PAYERS_ENDPOINT = "/finance/account/payers"

export const getFinancePayers = async (params?: {
  sortBy?: string
  order?: "asc" | "desc"
}): Promise<GetFinancePayersResponse> => {
  return get<GetFinancePayersResponse>(FINANCE_PAYERS_ENDPOINT, params)
}

export const createFinancePayer = async (
  payload: CreateFinancePayerRequest,
): Promise<CreateFinancePayerResponse> => {
  return post<CreateFinancePayerResponse>(FINANCE_PAYERS_ENDPOINT, payload)
}

export const updateFinancePayer = async (
  payload: UpdateFinancePayerRequest,
): Promise<UpdateFinancePayerResponse> => {
  return patch<UpdateFinancePayerResponse>(FINANCE_PAYERS_ENDPOINT, payload)
}

export const deleteFinancePayer = async (
  payerId: string,
): Promise<DeleteFinancePayerResponse> => {
  return del<DeleteFinancePayerResponse>(FINANCE_PAYERS_ENDPOINT, {
    payer_id: payerId,
  })
}
