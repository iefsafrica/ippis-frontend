import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getSupportTickets,
  getSupportTicket,
  createSupportTicket,
  updateSupportTicket,
  deleteSupportTicket,
} from "@/services/endpoints/supportTickets/supportTickets"
import {
  GET_SUPPORT_TICKETS,
  GET_SUPPORT_TICKET,
  CREATE_SUPPORT_TICKET,
  UPDATE_SUPPORT_TICKET,
  DELETE_SUPPORT_TICKET,
} from "@/services/constants/supportTickets"
import type {
  CreateSupportTicketRequest,
  CreateSupportTicketResponse,
  DeleteSupportTicketResponse,
  GetSupportTicketResponse,
  GetSupportTicketsResponse,
  UpdateSupportTicketRequest,
  UpdateSupportTicketResponse,
} from "@/types/supportTickets"

export const useGetSupportTickets = () => {
  return useQuery<GetSupportTicketsResponse>({
    queryKey: [GET_SUPPORT_TICKETS],
    queryFn: getSupportTickets,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  })
}

export const useGetSupportTicket = (ticketId?: string) => {
  return useQuery<GetSupportTicketResponse>({
    queryKey: [GET_SUPPORT_TICKET, ticketId],
    queryFn: () => {
      if (!ticketId) {
        throw new Error("Support ticket id is required")
      }
      return getSupportTicket(ticketId)
    },
    enabled: typeof ticketId === "string" && ticketId.length > 0,
  })
}

export const useCreateSupportTicket = () => {
  const queryClient = useQueryClient()
  return useMutation<CreateSupportTicketResponse, Error, CreateSupportTicketRequest>({
    mutationKey: [CREATE_SUPPORT_TICKET],
    mutationFn: createSupportTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_SUPPORT_TICKETS] })
    },
  })
}

export const useUpdateSupportTicket = () => {
  const queryClient = useQueryClient()
  return useMutation<
    UpdateSupportTicketResponse,
    Error,
    { ticketId: string; data: UpdateSupportTicketRequest }
  >({
    mutationKey: [UPDATE_SUPPORT_TICKET],
    mutationFn: ({ ticketId, data }) => updateSupportTicket(ticketId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_SUPPORT_TICKETS] })
      queryClient.invalidateQueries({ queryKey: [GET_SUPPORT_TICKET, variables.ticketId] })
    },
  })
}

export const useDeleteSupportTicket = () => {
  const queryClient = useQueryClient()
  return useMutation<DeleteSupportTicketResponse, Error, string>({
    mutationKey: [DELETE_SUPPORT_TICKET],
    mutationFn: deleteSupportTicket,
    onSuccess: (_, ticketId) => {
      queryClient.invalidateQueries({ queryKey: [GET_SUPPORT_TICKETS] })
      queryClient.invalidateQueries({ queryKey: [GET_SUPPORT_TICKET, ticketId] })
    },
  })
}
