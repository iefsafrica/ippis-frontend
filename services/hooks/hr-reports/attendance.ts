import { useQuery } from "@tanstack/react-query"
import { getAttendances } from "@/services/endpoints/hr-reports/attendance"
import { HR_REPORTS_ATTENDANCE_QUERY_KEYS } from "@/services/constants/hr-reports/attendance"
import type { HrReportAttendancesData } from "@/types/hr-reports/attendance"

export const useHrAttendances = (params?: { start_date?: string; end_date?: string; department?: string }) => {
  return useQuery<HrReportAttendancesData, Error>({
    queryKey: [
      HR_REPORTS_ATTENDANCE_QUERY_KEYS.LIST,
      params?.start_date ?? null,
      params?.end_date ?? null,
      params?.department ?? null,
    ],
    queryFn: () => getAttendances(params),
    keepPreviousData: true,
  })
}
