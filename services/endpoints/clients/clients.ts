import { del, get, post, put } from "@/services/axios"
import type {
  CreateClientRequest,
  CreateClientResponse,
  DeleteClientResponse,
  GetClientResponse,
  GetClientsResponse,
  UpdateClientRequest,
  UpdateClientResponse,
} from "@/types/clients"

const BASE_CLIENT_ENDPOINT = "/client"

export const getClients = async (): Promise<GetClientsResponse> => {
  return get<GetClientsResponse>(BASE_CLIENT_ENDPOINT)
}

export const getClient = async (id: number): Promise<GetClientResponse> => {
  return get<GetClientResponse>(BASE_CLIENT_ENDPOINT, { id })
}

export const createClient = async (
  payload: CreateClientRequest,
): Promise<CreateClientResponse> => {
  return post<CreateClientResponse>(BASE_CLIENT_ENDPOINT, payload)
}

export const updateClient = async (
  id: number,
  payload: UpdateClientRequest,
): Promise<UpdateClientResponse> => {
  return put<UpdateClientResponse>(BASE_CLIENT_ENDPOINT, payload, {
    params: { id },
  })
}

export const deleteClient = async (id: number): Promise<DeleteClientResponse> => {
  return del<DeleteClientResponse>(BASE_CLIENT_ENDPOINT, { id })
}
