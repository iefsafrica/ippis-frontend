import { useQuery } from "@tanstack/react-query"
import { getCalendarMeetings } from "@/services/endpoints/calendar/meetings"
import { GET_CALENDAR_MEETINGS } from "@/services/constants/calendar/meetings"
import type { GetCalendarMeetingsResponse } from "@/types/calendar/meetings"

export const useGetCalendarMeetings = () => {
  return useQuery<GetCalendarMeetingsResponse>({
    queryKey: [GET_CALENDAR_MEETINGS],
    queryFn: getCalendarMeetings,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  })
}
