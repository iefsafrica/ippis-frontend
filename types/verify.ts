export interface VerifyNinData {
  nin: string
  verified: boolean
  [key: string]: unknown
}

export interface VerifyNinResponse {
  success: boolean
  message: string
  data?: VerifyNinData
}

export interface VerifyNinPayload {
  nin: string
}
