export interface PersonalInfoPayload {
  [key: string]: unknown;
}

export interface PersonalInfoResponse {
  success: boolean;
  message: string;
  nextStep?: string;
}

export const submitPersonalInfo = async (
  payload: PersonalInfoPayload,
): Promise<PersonalInfoResponse> => {
  const response = await fetch("/api/register/personal-info", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to submit personal info");
  }

  return response.json() as Promise<PersonalInfoResponse>;
};
