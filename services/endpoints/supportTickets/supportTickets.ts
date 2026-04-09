import { del, get, patch, post } from "@/services/axios"
import type {
  CreateSupportTicketRequest,
  CreateSupportTicketResponse,
  DeleteSupportTicketResponse,
  GetSupportTicketResponse,
  GetSupportTicketsResponse,
  UpdateSupportTicketRequest,
  UpdateSupportTicketResponse,
} from "@/types/supportTickets"

const SUPPORT_TICKETS_ENDPOINT = "/support_tickets"

export const getSupportTickets = async (): Promise<GetSupportTicketsResponse> => {
  return get<GetSupportTicketsResponse>(SUPPORT_TICKETS_ENDPOINT)
}

export const getSupportTicket = async (
  ticketId: string,
): Promise<GetSupportTicketResponse> => {
  return get<GetSupportTicketResponse>(SUPPORT_TICKETS_ENDPOINT, {
    ticket_id: ticketId,
  })
}

export const createSupportTicket = async (
  payload: CreateSupportTicketRequest,
): Promise<CreateSupportTicketResponse> => {
  return post<CreateSupportTicketResponse>(SUPPORT_TICKETS_ENDPOINT, payload)
}

export const updateSupportTicket = async (
  ticketId: string,
  payload: UpdateSupportTicketRequest,
): Promise<UpdateSupportTicketResponse> => {
  return patch<UpdateSupportTicketResponse>(SUPPORT_TICKETS_ENDPOINT, {
    ticket_id: ticketId,
    ...payload,
  })
}

export const deleteSupportTicket = async (
  ticketId: string,
): Promise<DeleteSupportTicketResponse> => {
  return del<DeleteSupportTicketResponse>(SUPPORT_TICKETS_ENDPOINT, {
    ticket_id: ticketId,
  })
}
