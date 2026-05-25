export interface VerifyNinData {
  nin: string
  verified: boolean
  title?: string
  firstname?: string
  surname?: string
  middlename?: string
  othername?: string
  telephoneno?: string
  email?: string
  birthdate?: string
  gender?: string
  maritalstatus?: string
  state_of_origin?: string
  birthlga?: string
  residence_state?: string
  address?: string
  nok_firstname?: string
  nok_surname?: string
  nok_relationship?: string
  nok_address1?: string
  registration_id?: string
  registrationId?: string
  [key: string]: unknown
}

export interface VerifyNinResponse {
  success: boolean
  message: string
  status?: string
  error?: string
  verified?: boolean
  registration_id?: string
  registrationId?: string
  data?: VerifyNinData
}

export interface VerifyNinPayload {
  nin: string
  registration_id?: string
}
