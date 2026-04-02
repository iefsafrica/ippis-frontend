import { del, get, post, put } from "@/services/axios"
import type {
  CreateTaxTypeRequest,
  CreateTaxTypeResponse,
  DeleteTaxTypeResponse,
  GetTaxTypeResponse,
  GetTaxTypesResponse,
  UpdateTaxTypeRequest,
  UpdateTaxTypeResponse,
} from "@/types/tax-types"

const BASE_TAX_TYPE_ENDPOINT = "/tax-types"

export const getTaxTypes = async (): Promise<GetTaxTypesResponse> => {
  return get<GetTaxTypesResponse>(BASE_TAX_TYPE_ENDPOINT)
}

export const getTaxType = async (id: number): Promise<GetTaxTypeResponse> => {
  return get<GetTaxTypeResponse>(BASE_TAX_TYPE_ENDPOINT, { id })
}

export const createTaxType = async (
  payload: CreateTaxTypeRequest,
): Promise<CreateTaxTypeResponse> => {
  return post<CreateTaxTypeResponse>(BASE_TAX_TYPE_ENDPOINT, payload)
}

export const updateTaxType = async (
  id: number,
  payload: UpdateTaxTypeRequest,
): Promise<UpdateTaxTypeResponse> => {
  return put<UpdateTaxTypeResponse>(BASE_TAX_TYPE_ENDPOINT, payload, {
    params: { id },
  })
}

export const deleteTaxType = async (id: number): Promise<DeleteTaxTypeResponse> => {
  return del<DeleteTaxTypeResponse>(BASE_TAX_TYPE_ENDPOINT, { id })
}
