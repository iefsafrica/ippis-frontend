import { post } from "@/services/axios"
import { VerifyNinPayload, VerifyNinResponse } from "@/types/verify"

export const verifyNin = async (payload: VerifyNinPayload): Promise<VerifyNinResponse> => {
  const response = await post<VerifyNinResponse>("/verify/nin", payload)
  return response
}
