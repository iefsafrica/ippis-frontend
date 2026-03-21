export interface DocumentUploadResponse {
  success: boolean;
  message: string;
}

import { post } from "@/services/axios";

export const submitRegistrationDocuments = async (
  formData: FormData,
): Promise<DocumentUploadResponse> => {
  const headers: Record<string, string> = {};
  const registrationId = formData.get("registration_id");
  if (registrationId) {
    headers["x-registration-id"] = String(registrationId);
  }

  return post<DocumentUploadResponse>(
    "/admin/documents/upload",
    formData,
    { headers }
  );
};
