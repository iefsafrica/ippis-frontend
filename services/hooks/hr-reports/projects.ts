import { useQuery } from "@tanstack/react-query";
import { getHrProjects } from "@/services/endpoints/hr-reports/projects";
import { HR_REPORTS_PROJECTS_QUERY_KEYS } from "@/services/constants/hr-reports/projects";

export const useHrProjects = () => {
  return useQuery({
    queryKey: [HR_REPORTS_PROJECTS_QUERY_KEYS.LIST],
    queryFn: getHrProjects,
  });
};
