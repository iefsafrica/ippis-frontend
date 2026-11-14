import { post } from "@/services/axios";

export interface RequestResumeLinkPayload {
  email: string;
  registration_id?: string;
  nin?: string;
}

export interface RequestResumeLinkResponse {
  success: boolean;
  message: string;
}

/**
 * Ask for a new continue / resume link for an in-progress application.
 * The link will only be emailed to the email already on the application.
 */
export const requestResumeLink = async (
  payload: RequestResumeLinkPayload
): Promise<RequestResumeLinkResponse> => {
  return post<RequestResumeLinkResponse>("/admin/employees/register/resume-link", payload);
};
