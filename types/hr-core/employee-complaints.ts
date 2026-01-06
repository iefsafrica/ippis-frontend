export interface EmployeeComplaint {
  id: number;
  employee_id: string;
  employee_name: string;
  complaint: string;
  department: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | string;
  assigned_to: string;
  submitted_on: string;
  created_at: string;
  updated_at: string;
}

export interface ComplaintComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
}

export interface ComplaintDocument {
  id: string;
  name: string;
  url: string;
}

export interface ComplaintDetails extends EmployeeComplaint {
  employeeAvatar?: string;
  title?: string;
  description?: string;
  documents: ComplaintDocument[];
  comments: ComplaintComment[];
  lastUpdated?: string;
}

export interface GetEmployeeComplaintsResponse {
  success: boolean;
  data: EmployeeComplaint[];
}

export interface GetEmployeeComplaintResponse {
  success: boolean;
  data: ComplaintDetails;
}

export interface CreateEmployeeComplaintRequest {
  employee_id: string;
  position?: string;
  submitted_on?: string;
  employee_name?: string;
  complaint: string;
  department: string;
  priority: 'low' | 'medium' | 'high' | string;
  assigned_to?: string;
  status?: string;
}

export interface CreateEmployeeComplaintResponse {
  success: boolean;
  message: string;
  data: EmployeeComplaint;
}

export interface UpdateEmployeeComplaintRequest {
  id?: number;
  status?: string;
  priority?: 'low' | 'medium' | 'high' | string;
  assigned_to?: string;
  complaint?: string;
}

export interface UpdateEmployeeComplaintResponse {
  success: boolean;
  message: string;
  data: EmployeeComplaint;
}

export interface DeleteEmployeeComplaintResponse {
  success: boolean;
  message: string;
}