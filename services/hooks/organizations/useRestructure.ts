import { useMutation, useQueryClient } from "@tanstack/react-query";
import { restructureOrganization } from "@/services/endpoints/organizations/restructure";
import { RestructurePayload } from "@/types/organizations/restructure";

export const useRestructureOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RestructurePayload) => restructureOrganization(payload),
    onSuccess: (data) => {
      // If it wasn't a dry run, invalidate companies, departments, users
      if (!data?.dry_run) {
        queryClient.invalidateQueries({ queryKey: ["companies"] });
        queryClient.invalidateQueries({ queryKey: ["departments"] });
        queryClient.invalidateQueries({ queryKey: ["employees"] });
        queryClient.invalidateQueries({ queryKey: ["users"] });
      }
    },
  });
};
