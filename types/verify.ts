export interface VerifyNinData {
  nin: string
  verified: boolean
  title?: string
  firstname?: string
  first_name?: string
  surname?: string
  last_name?: string
  middlename?: string
  middle_name?: string
  othername?: string
  other_name?: string
  telephoneno?: string
  phone?: string
  phone_number?: string
  email?: string
  birthdate?: string
  date_of_birth?: string
  dob?: string
  birth_date?: string
  dateOfBirth?: string
  birthDate?: string
  DateOfBirth?: string
  BirthDate?: string
  bdate?: string
  gender?: string
  sex?: string
  maritalstatus?: string
  marital_status?: string
  state_of_origin?: string
  self_origin_state?: string
  birthstate?: string
  birthlga?: string
  residence_lga?: string
  lga_origin?: string
  self_origin_lga?: string
  residence_state?: string
  residenceState?: string
  address?: string
  residence_address?: string
  residenceAdressLine1?: string
  residence_address_line1?: string
  nok_name?: string
  nok_firstname?: string
  nok_surname?: string
  nok_relationship?: string
  nok_phone?: string
  nok_address1?: string
  nok_address?: string
  registration_id?: string
  registrationId?: string
  photo?: string
  photo_base64?: string
  photoBase64?: string
  image?: string
  passport?: string
  picture?: string
  profileImage?: string
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
