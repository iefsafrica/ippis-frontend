import { del, get, patch, post } from "@/services/axios"
import type {
  CreateFinancePayeeRequest,
  CreateFinancePayeeResponse,
  DeleteFinancePayeeResponse,
  GetFinancePayeesResponse,
  UpdateFinancePayeeRequest,
  UpdateFinancePayeeResponse,
} from "@/types/finance/payees"

const FINANCE_PAYEES_ENDPOINT = "/finance/payees"

export const getFinancePayees = async (params?: {
  sortBy?: string
  order?: "asc" | "desc"
}): Promise<GetFinancePayeesResponse> => {
  return get<GetFinancePayeesResponse>(FINANCE_PAYEES_ENDPOINT, params)
}

export const createFinancePayee = async (
  payload: CreateFinancePayeeRequest,
): Promise<CreateFinancePayeeResponse> => {
  return post<CreateFinancePayeeResponse>(FINANCE_PAYEES_ENDPOINT, payload)
}

export const updateFinancePayee = async (
  payload: UpdateFinancePayeeRequest,
): Promise<UpdateFinancePayeeResponse> => {
  return patch<UpdateFinancePayeeResponse>(FINANCE_PAYEES_ENDPOINT, payload)
}

export const deleteFinancePayee = async (
  payeeId: string,
): Promise<DeleteFinancePayeeResponse> => {
  return del<DeleteFinancePayeeResponse>(FINANCE_PAYEES_ENDPOINT, {
    payee_id: payeeId,
  })
}
