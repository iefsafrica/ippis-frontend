import axios from "axios"
import { post } from "@/services/axios"
import { VerifyNinPayload, VerifyNinResponse } from "@/types/verify"

export const verifyNin = async (payload: VerifyNinPayload): Promise<VerifyNinResponse> => {
  try {
    const response = await post<VerifyNinResponse>("/verify/nin", payload)
    return response
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data as Partial<VerifyNinResponse> | undefined
      return {
        success: false,
        message:
          responseData?.error ||
          responseData?.message ||
          error.response?.statusText ||
          error.message ||
          "Request failed",
        status: responseData?.status,
        error: responseData?.error || responseData?.message || error.message,
        verified: false,
        data: responseData?.data,
      }
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : "Request failed",
      error: error instanceof Error ? error.message : "Request failed",
      verified: false,
    }
  }
}
