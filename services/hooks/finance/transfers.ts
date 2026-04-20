import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  CREATE_FINANCE_TRANSFER,
  DELETE_FINANCE_TRANSFER,
  GET_FINANCE_TRANSFER,
  GET_FINANCE_TRANSFERS,
  UPDATE_FINANCE_TRANSFER,
} from "@/services/constants/finance"
import {
  createFinanceTransfer,
  deleteFinanceTransfer,
  getFinanceTransfer,
  getFinanceTransfers,
  updateFinanceTransfer,
} from "@/services/endpoints/finance/transfers"
import type {
  CreateFinanceTransferRequest,
  CreateFinanceTransferResponse,
  DeleteFinanceTransferResponse,
  GetFinanceTransferResponse,
  GetFinanceTransfersResponse,
  UpdateFinanceTransferRequest,
  UpdateFinanceTransferResponse,
} from "@/types/finance/transfers"

export const useGetFinanceTransfers = (params?: { transfer_id?: string }) => {
  return useQuery<GetFinanceTransfersResponse>({
    queryKey: [GET_FINANCE_TRANSFERS, params ?? {}],
    queryFn: () => getFinanceTransfers(params),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

export const useGetFinanceTransfer = (transferId?: string, enabled = true) => {
  return useQuery<GetFinanceTransferResponse>({
    queryKey: [GET_FINANCE_TRANSFER, transferId],
    queryFn: () => getFinanceTransfer(transferId || ""),
    enabled: Boolean(transferId) && enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

export const useCreateFinanceTransfer = () => {
  const queryClient = useQueryClient()
  return useMutation<CreateFinanceTransferResponse, Error, CreateFinanceTransferRequest>({
    mutationKey: [CREATE_FINANCE_TRANSFER],
    mutationFn: createFinanceTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_FINANCE_TRANSFERS] })
    },
  })
}

export const useUpdateFinanceTransfer = () => {
  const queryClient = useQueryClient()
  return useMutation<UpdateFinanceTransferResponse, Error, UpdateFinanceTransferRequest>({
    mutationKey: [UPDATE_FINANCE_TRANSFER],
    mutationFn: updateFinanceTransfer,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_FINANCE_TRANSFERS] })
      queryClient.invalidateQueries({ queryKey: [GET_FINANCE_TRANSFER, variables.transfer_id] })
    },
  })
}

export const useDeleteFinanceTransfer = () => {
  const queryClient = useQueryClient()
  return useMutation<DeleteFinanceTransferResponse, Error, string>({
    mutationKey: [DELETE_FINANCE_TRANSFER],
    mutationFn: deleteFinanceTransfer,
    onSuccess: (_, transferId) => {
      queryClient.invalidateQueries({ queryKey: [GET_FINANCE_TRANSFERS] })
      queryClient.invalidateQueries({ queryKey: [GET_FINANCE_TRANSFER, transferId] })
    },
  })
}
