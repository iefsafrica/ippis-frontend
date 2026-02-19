import {
  CreateCompanyPayload,
  CreateCompanyResponse,
  DeleteCompanyResponse,
  GetCompaniesResponse,
  GetCompanyResponse,
  UpdateCompanyPayload,
  UpdateCompanyResponse,
} from "@/types/organizations/company/company-management";

const COMPANY_BASE_URL = "/api/admin/organization/company";

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

export const getCompanies = async (): Promise<GetCompaniesResponse> => {
  const response = await request<GetCompaniesResponse>(COMPANY_BASE_URL);
  return response;
};

export const getCompanyById = async (
  id: string | number
): Promise<GetCompanyResponse> => {
  const response = await request<GetCompanyResponse>(`${COMPANY_BASE_URL}?id=${id}`);
  return response;
};

export const createCompany = async (
  payload: CreateCompanyPayload
): Promise<CreateCompanyResponse> => {
  const response = await request<CreateCompanyResponse>(COMPANY_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return response;
};

export const updateCompany = async (
  id: string | number,
  payload: UpdateCompanyPayload
): Promise<UpdateCompanyResponse> => {
  const updatePayload = {
    id: String(id),
    ...payload,
  };

  const response = await request<UpdateCompanyResponse>(`${COMPANY_BASE_URL}?id=${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatePayload),
  });
  return response;
};

export const deleteCompany = async (
  id: string | number
): Promise<DeleteCompanyResponse> => {
  const response = await request<DeleteCompanyResponse>(`${COMPANY_BASE_URL}?id=${id}`, {
    method: "DELETE",
  });
  return response;
};
