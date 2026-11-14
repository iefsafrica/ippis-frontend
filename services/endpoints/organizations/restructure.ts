import { post } from "@/services/axios";
import { RestructurePayload, RestructureResponse } from "@/types/organizations/restructure";

/**
 * Execute or dry-run organization restructuring (move department or merge MDA)
 */
export const restructureOrganization = async (
  payload: RestructurePayload
): Promise<RestructureResponse> => {
  return post<RestructureResponse>("/admin/organization/restructure", payload);
};
