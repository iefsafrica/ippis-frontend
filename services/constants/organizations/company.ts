export const COMPANY_QUERY_KEYS = {
  COMPANIES: "organization-companies",
  COMPANY: "organization-company",
  CREATE_COMPANY: "organization-create-company",
  UPDATE_COMPANY: "organization-update-company",
  DELETE_COMPANY: "organization-delete-company",
} as const;

export const GET_COMPANIES = COMPANY_QUERY_KEYS.COMPANIES;
export const GET_COMPANY = COMPANY_QUERY_KEYS.COMPANY;
export const CREATE_COMPANY = COMPANY_QUERY_KEYS.CREATE_COMPANY;
export const UPDATE_COMPANY = COMPANY_QUERY_KEYS.UPDATE_COMPANY;
export const DELETE_COMPANY = COMPANY_QUERY_KEYS.DELETE_COMPANY;

