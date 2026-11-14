export interface PersonalInfoPayload {
  [key: string]: unknown;
}

export interface PersonalInfoResponse {
  success: boolean;
  message: string;
  nextStep?: string;
}

import { post } from "@/services/axios";

export const submitPersonalInfo = async (
  payload: PersonalInfoPayload,
): Promise<PersonalInfoResponse> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (payload.registration_id) {
    headers["x-registration-id"] = String(payload.registration_id);
  }

  const token =
    (payload.registration_token as string) ||
    (payload.token as string) ||
    (typeof window !== "undefined" ? localStorage.getItem("registration_token") : null);
  if (token) {
    headers["x-registration-token"] = token;
  }

  return post<PersonalInfoResponse>(
    "/admin/employees/register/personal",
    payload,
    { headers }
  );
};
