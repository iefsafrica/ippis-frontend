import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getCalendarEvents, 
  getCalendarEvent, 
  createCalendarEvent, 
  updateCalendarEvent, 
  deleteCalendarEvent 
} from "@/services/endpoints/calendar/events";
import { 
  CREATE_CALENDAR_EVENT, 
  GET_CALENDAR_EVENTS, 
  GET_CALENDAR_EVENT, 
  UPDATE_CALENDAR_EVENT, 
  DELETE_CALENDAR_EVENT 
} from "@/services/constants/calendar/events";
import { 
  CreateCalendarEventRequest, 
  CreateCalendarEventResponse,
  UpdateCalendarEventRequest,
  UpdateCalendarEventResponse,
  DeleteCalendarEventResponse,
  CalendarEventQueryParams
} from "@/types/calendar/events";

export const useGetCalendarEvents = (params?: CalendarEventQueryParams) => {
  return useQuery({
    queryKey: [GET_CALENDAR_EVENTS, params],
    queryFn: () => getCalendarEvents(params),
    staleTime: 1000 * 60 * 5, 
    gcTime: 1000 * 60 * 10, 
  });
};

export const useGetCalendarEvent = (params: CalendarEventQueryParams) => {
  return useQuery({
    queryKey: [GET_CALENDAR_EVENT, params],
    queryFn: () => getCalendarEvent(params),
    enabled: !!(params.id || params.department),
  });
};

export const useCreateCalendarEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation<CreateCalendarEventResponse, Error, CreateCalendarEventRequest>({
    mutationKey: [CREATE_CALENDAR_EVENT],
    mutationFn: createCalendarEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_CALENDAR_EVENTS] });
    },
  });
};

export const useUpdateCalendarEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation<UpdateCalendarEventResponse, Error, UpdateCalendarEventRequest>({
    mutationKey: [UPDATE_CALENDAR_EVENT],
    mutationFn: updateCalendarEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_CALENDAR_EVENTS] });
    },
  });
};

export const useDeleteCalendarEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation<DeleteCalendarEventResponse, Error, number>({
    mutationKey: [DELETE_CALENDAR_EVENT],
    mutationFn: deleteCalendarEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_CALENDAR_EVENTS] });
    },
  });
};
