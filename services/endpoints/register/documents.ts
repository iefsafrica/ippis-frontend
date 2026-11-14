export interface DocumentUploadResponse {
  success: boolean;
  message: string;
}

import { post } from "@/services/axios";

export const submitRegistrationDocuments = async (
  formData: FormData,
): Promise<DocumentUploadResponse> => {
  const registrationId = formData.get("registration_id");
  if (registrationId) {
    headers["x-registration-id"] = String(registrationId);
  }

  const token =
    (formData.get("registration_token") as string) ||
    (formData.get("token") as string) ||
    (typeof window !== "undefined" ? localStorage.getItem("registration_token") : null);
  if (token) {
    headers["x-registration-token"] = token;
  }

  return post<DocumentUploadResponse>(
    "/admin/documents/upload",
    formData,
    { headers }
  );
};
