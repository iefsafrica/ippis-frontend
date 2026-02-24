export type LocationStatus = "active" | "inactive" | "pending" | string;

export interface Location {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  status: LocationStatus;
  created_at?: string;
  updated_at?: string;
  company_code?: string;
  company_name?: string;
}

export interface GetLocationsResponse {
  success: boolean;
  data: Location[];
}

export interface GetLocationByIdResponse {
  success: boolean;
  data: Location;
}

export interface CreateLocationPayload {
  name: string;
  company_code: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  status?: LocationStatus;
}

export interface CreateLocationResponse {
  success: boolean;
  message?: string;
  data: Location;
}

export interface UpdateLocationPayload {
  id: string | number;
  name?: string;
  company_code?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  status?: LocationStatus;
}

export interface UpdateLocationResponse {
  success: boolean;
  message?: string;
  data: Location;
}

export interface DeleteLocationResponse {
  success: boolean;
  message?: string;
  data?: Location;
}
