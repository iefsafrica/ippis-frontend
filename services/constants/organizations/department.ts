export const DEPARTMENT_QUERY_KEYS = {
  DEPARTMENTS: "organization-departments",
  DEPARTMENT: "organization-department",
  CREATE_DEPARTMENT: "organization-create-department",
  UPDATE_DEPARTMENT: "organization-update-department",
  DELETE_DEPARTMENT: "organization-delete-department",
} as const;

export const GET_DEPARTMENTS = DEPARTMENT_QUERY_KEYS.DEPARTMENTS;
export const GET_DEPARTMENT = DEPARTMENT_QUERY_KEYS.DEPARTMENT;
export const CREATE_DEPARTMENT = DEPARTMENT_QUERY_KEYS.CREATE_DEPARTMENT;
export const UPDATE_DEPARTMENT = DEPARTMENT_QUERY_KEYS.UPDATE_DEPARTMENT;
export const DELETE_DEPARTMENT = DEPARTMENT_QUERY_KEYS.DELETE_DEPARTMENT;

