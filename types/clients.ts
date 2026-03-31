export interface Client {
  id: number
  client_code: string
  name: string
  contact_person: string
  email: string
  phone: string
  status: string
  created_at: string
  updated_at: string
}

interface ClientsListData {
  clients: Client[]
}

export interface GetClientsResponse {
  success: boolean
  data: ClientsListData
  message?: string
}

export interface GetClientResponse {
  success: boolean
  data: ClientsListData
  message?: string
}

export interface CreateClientRequest {
  name: string
  contact_person: string
  email: string
  phone: string
  status: string
}

export interface CreateClientResponse {
  success: boolean
  message: string
  data: Client
}

export interface UpdateClientRequest {
  id?: number
  name?: string
  contact_person?: string
  email?: string
  phone?: string
  status?: string
}

export interface UpdateClientResponse {
  success: boolean
  message: string
  data: Client
}

export interface DeleteClientResponse {
  success: boolean
  message: string
}
