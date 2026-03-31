import { del, get, post, put } from "@/services/axios"
import type {
  CreateInvoiceRequest,
  CreateInvoiceResponse,
  DeleteInvoiceResponse,
  GetInvoiceResponse,
  GetInvoicesResponse,
  UpdateInvoiceRequest,
  UpdateInvoiceResponse,
} from "@/types/invoices"

const BASE_INVOICE_ENDPOINT = "/invoice"

export const getInvoices = async (): Promise<GetInvoicesResponse> => {
  return get<GetInvoicesResponse>(BASE_INVOICE_ENDPOINT)
}

export const getInvoice = async (id: number): Promise<GetInvoiceResponse> => {
  return get<GetInvoiceResponse>(BASE_INVOICE_ENDPOINT, { id })
}

export const createInvoice = async (
  payload: CreateInvoiceRequest,
): Promise<CreateInvoiceResponse> => {
  return post<CreateInvoiceResponse>(BASE_INVOICE_ENDPOINT, payload)
}

export const updateInvoice = async (
  id: number,
  payload: UpdateInvoiceRequest,
): Promise<UpdateInvoiceResponse> => {
  return put<UpdateInvoiceResponse>(BASE_INVOICE_ENDPOINT, payload, {
    params: { id },
  })
}

export const deleteInvoice = async (id: number): Promise<DeleteInvoiceResponse> => {
  return del<DeleteInvoiceResponse>(BASE_INVOICE_ENDPOINT, { id })
}
