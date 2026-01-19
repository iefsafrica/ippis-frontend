import { 
  get, 
  post, 
  put, 
  del 
} from "@/services/axios";
import { 
  GetCalendarEventsResponse,
  CreateCalendarEventRequest, 
  CreateCalendarEventResponse,
  UpdateCalendarEventRequest,
  UpdateCalendarEventResponse,
  DeleteCalendarEventResponse,
  CalendarEventQueryParams
} from "@/types/calendar/events";

export const getCalendarEvents = async (
  params?: CalendarEventQueryParams
): Promise<GetCalendarEventsResponse> => {
  const queryString = params
    ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
    : "";
  const response = await get<GetCalendarEventsResponse>(`/admin/hr/calendar/events${queryString}`);
  return response;
};

export const getCalendarEvent = async (
  params: CalendarEventQueryParams
): Promise<GetCalendarEventsResponse> => {
  const queryString = `?${new URLSearchParams(params as Record<string, string>).toString()}`;
  const response = await get<GetCalendarEventsResponse>(`/admin/hr/calendar/events${queryString}`);
  return response;
};

export const createCalendarEvent = async (
  payload: CreateCalendarEventRequest
): Promise<CreateCalendarEventResponse> => {
  const response = await post<CreateCalendarEventResponse>("/admin/hr/calendar/events", payload);
  return response;
};

export const updateCalendarEvent = async (
  payload: UpdateCalendarEventRequest
): Promise<UpdateCalendarEventResponse> => {
  const response = await put<UpdateCalendarEventResponse>("/admin/hr/calendar/events", payload);
  return response;
};

export const deleteCalendarEvent = async (id: number): Promise<DeleteCalendarEventResponse> => {
  const response = await del<DeleteCalendarEventResponse>(`/admin/hr/calendar/events?id=${id}`);
  return response;
};
