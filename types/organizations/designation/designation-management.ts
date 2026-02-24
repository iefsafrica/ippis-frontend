export type DesignationStatus = "active" | "inactive" | "pending" | string;

export interface Designation {
  id: string | number;
  company_code: string;
  title: string;
  description?: string;
  status: DesignationStatus;
  created_at?: string;
  updated_at?: string;
  company_name?: string;
}

export interface GetDesignationsResponse {
  success: boolean;
  data: Designation[];
}

export interface GetDesignationByIdResponse {
  success: boolean;
  message?: string;
  data: Designation;
}

export interface CreateDesignationPayload {
  company_code: string;
  title: string;
  description?: string;
  status?: DesignationStatus;
}

export interface CreateDesignationResponse {
  success: boolean;
  message?: string;
  data: Designation;
}

export interface UpdateDesignationPayload {
  id: string | number;
  title?: string;
  designation_name?: string;
  description?: string;
  status?: DesignationStatus;
}

export interface UpdateDesignationResponse {
  success: boolean;
  message?: string;
  data: Designation;
}

export interface DeleteDesignationResponse {
  success: boolean;
  message?: string;
  data?: Designation;
}
