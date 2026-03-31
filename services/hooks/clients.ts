import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  CREATE_CLIENT,
  DELETE_CLIENT,
  GET_CLIENT,
  GET_CLIENTS,
  UPDATE_CLIENT,
} from "@/services/constants/clients"
import {
  createClient,
  deleteClient,
  getClient,
  getClients,
  updateClient,
} from "@/services/endpoints/clients/clients"
import type {
  CreateClientRequest,
  CreateClientResponse,
  DeleteClientResponse,
  GetClientResponse,
  GetClientsResponse,
  UpdateClientRequest,
  UpdateClientResponse,
} from "@/types/clients"

export const useGetClients = () => {
  return useQuery<GetClientsResponse>({
    queryKey: [GET_CLIENTS],
    queryFn: getClients,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  })
}

export const useGetClient = (id?: number) => {
  return useQuery<GetClientResponse>({
    queryKey: [GET_CLIENT, id],
    queryFn: () => {
      if (typeof id !== "number") {
        throw new Error("Client id is required")
      }
      return getClient(id)
    },
    enabled: typeof id === "number",
  })
}

export const useCreateClient = () => {
  const queryClient = useQueryClient()
  return useMutation<CreateClientResponse, Error, CreateClientRequest>({
    mutationKey: [CREATE_CLIENT],
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_CLIENTS] })
    },
  })
}

export const useUpdateClient = () => {
  const queryClient = useQueryClient()
  return useMutation<
    UpdateClientResponse,
    Error,
    { id: number; data: UpdateClientRequest }
  >({
    mutationKey: [UPDATE_CLIENT],
    mutationFn: ({ id, data }) => updateClient(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_CLIENTS] })
      queryClient.invalidateQueries({ queryKey: [GET_CLIENT, variables.id] })
    },
  })
}

export const useDeleteClient = () => {
  const queryClient = useQueryClient()
  return useMutation<DeleteClientResponse, Error, number>({
    mutationKey: [DELETE_CLIENT],
    mutationFn: deleteClient,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [GET_CLIENTS] })
      queryClient.invalidateQueries({ queryKey: [GET_CLIENT, id] })
    },
  })
}
