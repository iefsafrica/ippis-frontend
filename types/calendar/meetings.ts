export interface CalendarMeeting {
  id: number
  meeting_title: string
  type: string
  date_time: string
  location: string
  status: string
  participants: number
}

export interface GetCalendarMeetingsResponse {
  success: boolean
  message: string
  total?: number
  data: CalendarMeeting[]
}

export interface UpdateCalendarMeetingRequest {
  id: number
  status?: string
}

export interface UpdateCalendarMeetingResponse {
  success: boolean
  message: string
  data?: CalendarMeeting
}
