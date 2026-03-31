import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  CREATE_INVOICE,
  DELETE_INVOICE,
  GET_INVOICE,
  GET_INVOICES,
  UPDATE_INVOICE,
} from "@/services/constants/invoices"
import {
  createInvoice,
  deleteInvoice,
  getInvoice,
  getInvoices,
  updateInvoice,
} from "@/services/endpoints/invoices/invoices"
import type {
  CreateInvoiceRequest,
  CreateInvoiceResponse,
  DeleteInvoiceResponse,
  GetInvoiceResponse,
  GetInvoicesResponse,
  UpdateInvoiceRequest,
  UpdateInvoiceResponse,
} from "@/types/invoices"

export const useGetInvoices = () => {
  return useQuery<GetInvoicesResponse>({
    queryKey: [GET_INVOICES],
    queryFn: getInvoices,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  })
}

export const useGetInvoice = (id?: number) => {
  return useQuery<GetInvoiceResponse>({
    queryKey: [GET_INVOICE, id],
    queryFn: () => {
      if (typeof id !== "number") {
        throw new Error("Invoice id is required")
      }
      return getInvoice(id)
    },
    enabled: typeof id === "number",
  })
}

export const useCreateInvoice = () => {
  const queryClient = useQueryClient()
  return useMutation<CreateInvoiceResponse, Error, CreateInvoiceRequest>({
    mutationKey: [CREATE_INVOICE],
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_INVOICES] })
    },
  })
}

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient()
  return useMutation<
    UpdateInvoiceResponse,
    Error,
    { id: number; data: UpdateInvoiceRequest }
  >({
    mutationKey: [UPDATE_INVOICE],
    mutationFn: ({ id, data }) => updateInvoice(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_INVOICES] })
      queryClient.invalidateQueries({ queryKey: [GET_INVOICE, variables.id] })
    },
  })
}

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient()
  return useMutation<DeleteInvoiceResponse, Error, number>({
    mutationKey: [DELETE_INVOICE],
    mutationFn: deleteInvoice,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [GET_INVOICES] })
      queryClient.invalidateQueries({ queryKey: [GET_INVOICE, id] })
    },
  })
}
