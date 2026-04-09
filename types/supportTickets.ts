export interface SupportTicket {
  id: number
  ticket_id: string
  subject: string
  description: string
  department: string
  priority: string
  status: string
  assigned_to: string | null
  attachment: string | null
  created_at: string
  updated_at: string
  created_by?: string
  due_date?: string
  progress?: number
}

interface SupportTicketListData {
  tickets: SupportTicket[]
}

export interface GetSupportTicketsResponse {
  success: boolean
  data: SupportTicketListData
  message?: string
}

export interface GetSupportTicketResponse {
  success: boolean
  data: SupportTicketListData
  message?: string
}

export interface CreateSupportTicketRequest {
  subject: string
  description: string
  department: string
  priority: string
  assigned_to?: string
  attachment?: string | null
  due_date?: string
  progress?: number
}

export interface CreateSupportTicketResponse {
  success: boolean
  message: string
  ticket: SupportTicket
}

export interface UpdateSupportTicketRequest {
  subject?: string
  description?: string
  department?: string
  priority?: string
  status?: string
  assigned_to?: string
  attachment?: string | null
  due_date?: string
  progress?: number
}

export interface UpdateSupportTicketResponse {
  success: boolean
  message: string
  ticket: SupportTicket
}

export interface DeleteSupportTicketResponse {
  success: boolean
  message: string
  ticketId: string
}
