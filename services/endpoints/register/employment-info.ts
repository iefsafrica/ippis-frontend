export interface EmploymentInfoPayload {
  [key: string]: unknown;
}

export interface EmploymentInfoResponse {
  success: boolean;
  message: string;
  nextStep?: string;
}

export const submitEmploymentInfo = async (
  payload: EmploymentInfoPayload,
): Promise<EmploymentInfoResponse> => {
  const response = await fetch("/api/register/employment-info", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to submit employment info");
  }

  return response.json() as Promise<EmploymentInfoResponse>;
};
