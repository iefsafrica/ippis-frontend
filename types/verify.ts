export interface VerifyNinData {
  nin: string
  verified: boolean
  registration_id?: string
  registrationId?: string
  [key: string]: unknown
}

export interface VerifyNinResponse {
  success: boolean
  message: string
  verified?: boolean
  registration_id?: string
  registrationId?: string
  data?: VerifyNinData
}

export interface VerifyNinPayload {
  nin: string
  registration_id?: string
}
