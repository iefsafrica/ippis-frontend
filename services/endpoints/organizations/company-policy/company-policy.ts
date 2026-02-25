import {
  CreateCompanyPolicyPayload,
  CreateCompanyPolicyResponse,
  DeleteCompanyPolicyResponse,
  GetCompanyPoliciesResponse,
  GetCompanyPolicyResponse,
  UpdateCompanyPolicyPayload,
  UpdateCompanyPolicyResponse,
} from "@/types/organizations/company-policy/company-policy-management";

const COMPANY_POLICY_BASE_URL = "/api/admin/organization/company-policy";

const getAuthHeaders = () => {
  const headers: Record<string, string> = {};
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const headers = new Headers(init?.headers);
  const authHeaders = getAuthHeaders();

  if (authHeaders.Authorization) {
    headers.set("Authorization", authHeaders.Authorization);
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Request failed");
  }

  return data as T;
};

export const getCompanyPolicies = async (): Promise<GetCompanyPoliciesResponse> => {
  const response = await request<GetCompanyPoliciesResponse>(COMPANY_POLICY_BASE_URL);
  return response;
};

export const getCompanyPolicyById = async (
  id: string | number
): Promise<GetCompanyPolicyResponse> => {
  const response = await request<GetCompanyPolicyResponse>(
    `${COMPANY_POLICY_BASE_URL}?id=${id}`
  );
  return response;
};

export const createCompanyPolicy = async (
  payload: CreateCompanyPolicyPayload
): Promise<CreateCompanyPolicyResponse> => {
  const response = await request<CreateCompanyPolicyResponse>(COMPANY_POLICY_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return response;
};

export const updateCompanyPolicy = async (
  payload: UpdateCompanyPolicyPayload
): Promise<UpdateCompanyPolicyResponse> => {
  const response = await request<UpdateCompanyPolicyResponse>(COMPANY_POLICY_BASE_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return response;
};

export const deleteCompanyPolicy = async (
  id: string | number
): Promise<DeleteCompanyPolicyResponse> => {
  const response = await request<DeleteCompanyPolicyResponse>(
    `${COMPANY_POLICY_BASE_URL}?id=${id}`,
    {
      method: "DELETE",
    }
  );
  return response;
};
