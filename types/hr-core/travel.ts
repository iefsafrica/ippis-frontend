export interface Travel {
  id: number;
  employee_id: string;
  employee_name: string;
  department: string;
  purpose: string;
  start_date: string;
  end_date: string;
  destination: string;
  travel_mode: string;
  accommodation: string;
  estimated_cost: string;
  advance_amount: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface LocalTravel {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  purpose: string;
  startDate: string;
  endDate: string;
  destination: string;
  travelMode: string;
  accommodation: string;
  estimatedCost: string;
  advanceAmount: string;
  status: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GetTravelsResponse {
  success: boolean;
  data: Travel[];
}

export interface GetTravelResponse {
  success: boolean;
  data: Travel | Travel[];
}

export interface CreateTravelRequest {
  employee_id: string;
  employee_name: string;
  department: string;
  purpose: string;
  start_date: string;
  end_date: string;
  destination: string;
  travel_mode: string;
  accommodation: string;
  estimated_cost: number;
  advance_amount: number;
}

export interface CreateTravelResponse {
  success: boolean;
  message: string;
  data: Travel;
}

export interface UpdateTravelRequest {
  id: number;
  employee_id?: string;
  employee_name?: string;
  department?: string;
  purpose?: string;
  start_date?: string;
  end_date?: string;
  destination?: string;
  travel_mode?: string;
  accommodation?: string;
  estimated_cost?: number;
  advance_amount?: number;
  status?: string;
}

export interface UpdateTravelResponse {
  success: boolean;
  message: string;
  data: Travel;
}

export interface DeleteTravelResponse {
  success: boolean;
  message: string;
}

export interface TravelQueryParams {
  id?: number;
  employee_id?: string;
}