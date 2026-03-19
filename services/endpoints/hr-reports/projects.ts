import { get } from "@/services/axios";
import { HrReportProjectsResponse } from "@/types/hr-reports/projects";

export const getHrProjects = async (): Promise<HrReportProjectsResponse> => {
  return get<HrReportProjectsResponse>("/admin/hr/projects");
};
