export type CompanyStatus = "active" | "inactive" | "pending" | string;

export interface Company {
  id: number;
  name: string;
  code?: string;
  email: string;
  phone: string;
  status: CompanyStatus;
  created_at: string;
  last_reviewed_at?: string;
  last_review_date?: string;
}

export interface GetCompaniesResponse {
  success: boolean;
  data: Company[];
}

export interface GetCompanyResponse {
  success: boolean;
  data: Company;
}

export interface CreateCompanyPayload {
  name: string;
  email: string;
  phone: string;
  status: CompanyStatus;
}

export interface CreateCompanyResponse {
  success: boolean;
  message?: string;
  data: Company;
}

export interface UpdateCompanyPayload {
  name?: string;
  email?: string;
  phone?: string;
  status?: CompanyStatus;
}

export interface UpdateCompanyResponse {
  success: boolean;
  message?: string;
  data: Company;
}

export interface DeleteCompanyResponse {
  success: boolean;
  message?: string;
  data?: Company;
}
