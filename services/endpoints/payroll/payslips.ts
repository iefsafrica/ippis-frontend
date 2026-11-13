import Cookies from "js-cookie";

const getAuthToken = () => {
  if (typeof window === "undefined") return "";
  return (
    Cookies.get("token") ||
    Cookies.get("ippis_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("ippis_token") ||
    ""
  );
};

const authHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface GeneratePayslipsPayload {
  month: number;
  year: number;
  period: string;
  mdaId?: string | number;
  departmentId?: string | number;
  employeeId?: string | number;
  paymentDate?: string;
  dryRun?: boolean;
}

export interface PayslipListFilters {
  period?: string;
  month?: number;
  year?: number;
  department_id?: string | number;
  mda_id?: string | number;
  company_id?: string | number;
  employee_id?: string | number;
  status?: string;
  page?: number;
  limit?: number;
}

export interface PayslipRecord {
  id: string | number;
  reference?: string;
  payment_id?: string;
  payslip_number?: string;
  employee_id?: string | number;
  employee_name?: string;
  employeeName?: string;
  ippis_number?: string;
  department?: string;
  department_name?: string;
  mda?: string;
  mda_name?: string;
  grade_level?: string;
  step?: string;
  grade_step?: string;
  position?: string;
  period?: string;
  month?: string | number;
  year?: number;
  payment_date?: string;
  generated_date?: string;
  created_at?: string;
  gross_pay?: number;
  total_earnings?: number;
  deductions?: number;
  total_deductions?: number;
  net_pay?: number;
  status?: string;
}

export interface PayslipDetailLineItem {
  label?: string;
  type?: string;
  name?: string;
  code?: string;
  amount: number;
}

export interface PayslipDetails {
  id: string | number;
  reference?: string;
  payment_id?: string;
  period?: string;
  month?: string | number;
  year?: number;
  payment_date?: string;
  generated_date?: string;
  created_at?: string;
  status?: string;
  employee?: {
    id?: string | number;
    name?: string;
    full_name?: string;
    ippis_number?: string;
    legacy_id?: string;
    mda?: string;
    department?: string;
    grade_level?: string;
    step?: string;
    cadre?: string;
    salary_structure?: string;
    location?: string;
    tax_state?: string;
    position?: string;
  };
  banking?: {
    bank_name?: string;
    account_number?: string;
    pfa?: string;
    rsa_pin?: string;
    payment_method?: string;
  };
  earnings?: PayslipDetailLineItem[] | Record<string, number>;
  deductions?: PayslipDetailLineItem[] | Record<string, number>;
  summary?: {
    gross_pay?: number;
    total_earnings?: number;
    total_deductions?: number;
    net_pay?: number;
    ytd_paid?: number;
    ytd_tax?: number;
    ytd_pension?: number;
  };
  // Flat fallbacks if backend returns top-level fields
  employee_id?: string | number;
  employee_name?: string;
  ippis_number?: string;
  mda?: string;
  department?: string;
  position?: string;
  bank_name?: string;
  account_number?: string;
  gross_pay?: number;
  total_deductions?: number;
  net_pay?: number;
}

export async function generatePayslips(payload: GeneratePayslipsPayload) {
  const res = await fetch("/api/payroll/payslips/generate", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || json?.error || "Failed to generate payslips");
  }
  return json;
}

export async function getPayslips(filters: PayslipListFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      params.set(key, String(value));
    }
  });

  const query = params.toString();
  const res = await fetch(`/api/payroll/payslips${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: authHeaders(),
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || json?.error || "Failed to load payslips");
  }
  return json;
}

export async function getPayslipById(id: string | number) {
  const res = await fetch(`/api/payroll/payslips/${encodeURIComponent(String(id))}`, {
    method: "GET",
    headers: authHeaders(),
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || json?.error || "Failed to load payslip details");
  }
  return json?.data || json?.payslip || json;
}

