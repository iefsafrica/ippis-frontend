export interface TaxType {
  id: number
  tax_code: string
  name: string
  rate: number | string
  description?: string
  status: string
  created_at: string
  updated_at: string
}

export interface GetTaxTypesResponse {
  success: boolean
  data: TaxType[]
  message?: string
}

export interface GetTaxTypeResponse {
  success: boolean
  data: TaxType
  message?: string
}

export interface CreateTaxTypeRequest {
  tax_code: string
  name: string
  rate: number
  description?: string
  status?: string
}

export interface CreateTaxTypeResponse {
  success: boolean
  message: string
  data: TaxType
}

export interface UpdateTaxTypeRequest {
  id?: number
  tax_code?: string
  name?: string
  rate?: number
  description?: string
  status?: string
}

export interface UpdateTaxTypeResponse {
  success: boolean
  message: string
  data: TaxType
}

export interface DeleteTaxTypeResponse {
  success: boolean
  message: string
}
