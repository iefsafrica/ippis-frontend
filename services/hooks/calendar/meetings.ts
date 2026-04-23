import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getCalendarMeetings, updateCalendarMeeting } from "@/services/endpoints/calendar/meetings"
import { GET_CALENDAR_MEETINGS, UPDATE_CALENDAR_MEETING } from "@/services/constants/calendar/meetings"
import type {
  GetCalendarMeetingsResponse,
  UpdateCalendarMeetingRequest,
  UpdateCalendarMeetingResponse,
} from "@/types/calendar/meetings"

export const useGetCalendarMeetings = () => {
  return useQuery<GetCalendarMeetingsResponse>({
    queryKey: [GET_CALENDAR_MEETINGS],
    queryFn: getCalendarMeetings,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  })
}

export const useUpdateCalendarMeeting = () => {
  const queryClient = useQueryClient()

  return useMutation<UpdateCalendarMeetingResponse, Error, UpdateCalendarMeetingRequest>({
    mutationKey: [UPDATE_CALENDAR_MEETING],
    mutationFn: updateCalendarMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_CALENDAR_MEETINGS] })
    },
  })
}
