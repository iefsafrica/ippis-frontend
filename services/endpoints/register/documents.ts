export interface DocumentUploadResponse {
  success: boolean;
  message: string;
}

export const submitRegistrationDocuments = async (
  formData: FormData,
): Promise<DocumentUploadResponse> => {
  const response = await fetch("/api/register/documents", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload documents");
  }

  return response.json() as Promise<DocumentUploadResponse>;
};
