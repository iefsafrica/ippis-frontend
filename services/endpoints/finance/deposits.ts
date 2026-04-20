import { del, get, patch, post } from "@/services/axios"
import type {
  CreateFinanceDepositRequest,
  CreateFinanceDepositResponse,
  DeleteFinanceDepositResponse,
  GetFinanceDepositResponse,
  GetFinanceDepositsResponse,
  UpdateFinanceDepositRequest,
  UpdateFinanceDepositResponse,
} from "@/types/finance/deposits"

const FINANCE_DEPOSITS_ENDPOINT = "/finance/account/deposits"

export const createFinanceDeposit = async (
  payload: CreateFinanceDepositRequest,
): Promise<CreateFinanceDepositResponse> => {
  return post<CreateFinanceDepositResponse>(FINANCE_DEPOSITS_ENDPOINT, payload)
}

export const getFinanceDeposits = async (params?: {
  deposit_id?: string
}): Promise<GetFinanceDepositsResponse> => {
  return get<GetFinanceDepositsResponse>(FINANCE_DEPOSITS_ENDPOINT, params)
}

export const getFinanceDeposit = async (depositId: string): Promise<GetFinanceDepositResponse> => {
  return get<GetFinanceDepositResponse>(FINANCE_DEPOSITS_ENDPOINT, {
    deposit_id: depositId,
  })
}

export const updateFinanceDeposit = async (
  payload: UpdateFinanceDepositRequest,
): Promise<UpdateFinanceDepositResponse> => {
  return patch<UpdateFinanceDepositResponse>(FINANCE_DEPOSITS_ENDPOINT, payload)
}

export const deleteFinanceDeposit = async (
  depositId: string,
): Promise<DeleteFinanceDepositResponse> => {
  return del<DeleteFinanceDepositResponse>(FINANCE_DEPOSITS_ENDPOINT, {
    deposit_id: depositId,
  })
}
