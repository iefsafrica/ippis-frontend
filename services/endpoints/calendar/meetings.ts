import { get } from "@/services/axios"
import type { GetCalendarMeetingsResponse } from "@/types/calendar/meetings"

export const getCalendarMeetings = async (): Promise<GetCalendarMeetingsResponse> => {
  return get<GetCalendarMeetingsResponse>("/admin/hr/calendar/meetings")
}
