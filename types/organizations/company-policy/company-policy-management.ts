export type CompanyPolicyStatus = "draft" | "published" | string;

export interface CompanyPolicy {
  id: string | number;
  company_code: string;
  title: string;
  content: string;
  status: CompanyPolicyStatus;
  publish_date?: string | null;
  expiry_date?: string | null;
  created_at?: string;
  updated_at?: string;
  company_name?: string;
}

export interface GetCompanyPoliciesResponse {
  success: boolean;
  message?: string;
  data: CompanyPolicy[];
}

export interface GetCompanyPolicyResponse {
  success: boolean;
  message?: string;
  data: CompanyPolicy;
}

export interface CreateCompanyPolicyPayload {
  company_code: string;
  title: string;
  content: string;
  status: CompanyPolicyStatus;
  publish_date?: string | null;
  expiry_date?: string | null;
}

export interface CreateCompanyPolicyResponse {
  success: boolean;
  message?: string;
  data: CompanyPolicy;
}

export interface UpdateCompanyPolicyPayload {
  id: string | number;
  title?: string;
  content?: string;
  status?: CompanyPolicyStatus;
  publish_date?: string | null;
  expiry_date?: string | null;
}

export interface UpdateCompanyPolicyResponse {
  success: boolean;
  message?: string;
  data: CompanyPolicy;
}

export interface DeleteCompanyPolicyResponse {
  success: boolean;
  message?: string;
  data?: CompanyPolicy;
}
