import { get, put } from "@/services/axios"
import type {
  GetCalendarMeetingsResponse,
  UpdateCalendarMeetingRequest,
  UpdateCalendarMeetingResponse,
} from "@/types/calendar/meetings"

export const getCalendarMeetings = async (): Promise<GetCalendarMeetingsResponse> => {
  return get<GetCalendarMeetingsResponse>("/admin/hr/calendar/meetings")
}

export const updateCalendarMeeting = async (
  payload: UpdateCalendarMeetingRequest,
): Promise<UpdateCalendarMeetingResponse> => {
  return put<UpdateCalendarMeetingResponse>("/admin/hr/calendar/meetings", payload)
}
