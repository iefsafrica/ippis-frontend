import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  CREATE_TAX_TYPE,
  DELETE_TAX_TYPE,
  GET_TAX_TYPE,
  GET_TAX_TYPES,
  UPDATE_TAX_TYPE,
} from "@/services/constants/tax-types"
import {
  createTaxType,
  deleteTaxType,
  getTaxType,
  getTaxTypes,
  updateTaxType,
} from "@/services/endpoints/tax-types/tax-types"
import type {
  CreateTaxTypeRequest,
  CreateTaxTypeResponse,
  DeleteTaxTypeResponse,
  GetTaxTypeResponse,
  GetTaxTypesResponse,
  UpdateTaxTypeRequest,
  UpdateTaxTypeResponse,
} from "@/types/tax-types"

export const useGetTaxTypes = () => {
  return useQuery<GetTaxTypesResponse>({
    queryKey: [GET_TAX_TYPES],
    queryFn: getTaxTypes,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  })
}

export const useGetTaxType = (id?: number) => {
  return useQuery<GetTaxTypeResponse>({
    queryKey: [GET_TAX_TYPE, id],
    queryFn: () => {
      if (typeof id !== "number") throw new Error("Tax type id is required")
      return getTaxType(id)
    },
    enabled: typeof id === "number",
  })
}

export const useCreateTaxType = () => {
  const queryClient = useQueryClient()
  return useMutation<CreateTaxTypeResponse, Error, CreateTaxTypeRequest>({
    mutationKey: [CREATE_TAX_TYPE],
    mutationFn: createTaxType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_TAX_TYPES] })
    },
  })
}

export const useUpdateTaxType = () => {
  const queryClient = useQueryClient()
  return useMutation<
    UpdateTaxTypeResponse,
    Error,
    { id: number; data: UpdateTaxTypeRequest }
  >({
    mutationKey: [UPDATE_TAX_TYPE],
    mutationFn: ({ id, data }) => updateTaxType(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_TAX_TYPES] })
      queryClient.invalidateQueries({ queryKey: [GET_TAX_TYPE, variables.id] })
    },
  })
}

export const useDeleteTaxType = () => {
  const queryClient = useQueryClient()
  return useMutation<DeleteTaxTypeResponse, Error, number>({
    mutationKey: [DELETE_TAX_TYPE],
    mutationFn: deleteTaxType,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [GET_TAX_TYPES] })
      queryClient.invalidateQueries({ queryKey: [GET_TAX_TYPE, id] })
    },
  })
}
