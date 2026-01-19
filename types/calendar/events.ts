export interface CalendarEvent {
  id: number;
  title: string;
  event_type: string;
  start_date: string;
  end_date: string;
  all_day: boolean;
  department: string;
  location: string;
  description: string;
  attendees: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface LocalCalendarEvent {
  id: string;
  title: string;
  eventType: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  department: string;
  location: string;
  description: string;
  attendees: string[];
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface GetCalendarEventsResponse {
  success: boolean;
  data: CalendarEvent[];
}

export interface CreateCalendarEventRequest {
  title: string;
  event_type: string;
  start_date: string;
  end_date: string;
  all_day: boolean;
  department: string;
  location: string;
  description: string;
  attendees: string[];
}

export interface CreateCalendarEventResponse {
  success: boolean;
  message: string;
  data: CalendarEvent;
}

export interface UpdateCalendarEventRequest {
  id: number;
  title?: string;
  event_type?: string;
  start_date?: string;
  end_date?: string;
  all_day?: boolean;
  department?: string;
  location?: string;
  description?: string;
  attendees?: string[];
  status?: string;
}

export interface UpdateCalendarEventResponse {
  success: boolean;
  message: string;
  data?: CalendarEvent;
}

export interface DeleteCalendarEventResponse {
  success: boolean;
  message: string;
}

export interface CalendarEventQueryParams {
  id?: number;
  department?: string;
}
