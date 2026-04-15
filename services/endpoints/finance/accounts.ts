import { del, get, patch, post } from "@/services/axios"
import type {
  CreateFinanceAccountRequest,
  CreateFinanceAccountResponse,
  DeleteFinanceAccountResponse,
  GetFinanceAccountsResponse,
  UpdateFinanceAccountRequest,
  UpdateFinanceAccountResponse,
} from "@/types/finance/accounts"

const FINANCE_ACCOUNTS_ENDPOINT = "/finance/account"

export const getFinanceAccounts = async (): Promise<GetFinanceAccountsResponse> => {
  return get<GetFinanceAccountsResponse>(FINANCE_ACCOUNTS_ENDPOINT)
}

export const createFinanceAccount = async (
  payload: CreateFinanceAccountRequest,
): Promise<CreateFinanceAccountResponse> => {
  return post<CreateFinanceAccountResponse>(FINANCE_ACCOUNTS_ENDPOINT, payload)
}

export const updateFinanceAccount = async (
  payload: UpdateFinanceAccountRequest,
): Promise<UpdateFinanceAccountResponse> => {
  return patch<UpdateFinanceAccountResponse>(FINANCE_ACCOUNTS_ENDPOINT, payload)
}

export const deleteFinanceAccount = async (
  accountId: string,
): Promise<DeleteFinanceAccountResponse> => {
  return del<DeleteFinanceAccountResponse>(FINANCE_ACCOUNTS_ENDPOINT, {
    account_id: accountId,
  })
}
