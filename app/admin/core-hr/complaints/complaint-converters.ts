import { EmployeeComplaint } from "@/types/hr-core/employee-complaints"

export interface LocalComplaint {
  id: string;
  employeeId: string;
  employeeName: string;
  complaint: string;
  department: string;
  status: string;
  priority: string;
  assignedTo: string;
  submittedOn: string;
  createdAt: string;
  updatedAt: string;
  employeeAvatar?: string;
  title?: string;
  description?: string;
  documents?: any[];
  comments?: any[];
}

export const convertApiComplaintToLocal = (apiComplaint: EmployeeComplaint): LocalComplaint => {
  return {
    id: `COMP-${apiComplaint.id.toString().padStart(4, '0')}`,
    employeeId: apiComplaint.employee_id,
    employeeName: apiComplaint.employee_name,
    complaint: apiComplaint.complaint,
    department: apiComplaint.department,
    status: apiComplaint.status,
    priority: apiComplaint.priority,
    assignedTo: apiComplaint.assigned_to,
    submittedOn: apiComplaint.submitted_on,
    createdAt: apiComplaint.created_at,
    updatedAt: apiComplaint.updated_at,
    employeeAvatar: getAvatarFromName(apiComplaint.employee_name),
    title: apiComplaint.complaint.split('\n')[0]?.substring(0, 100) || apiComplaint.complaint.substring(0, 100),
    description: apiComplaint.complaint,
  }
}

export const convertLocalComplaintToApi = (localComplaint: Partial<LocalComplaint>): any => {
  return {
    employee_id: localComplaint.employeeId,
    employee_name: localComplaint.employeeName,
    complaint: localComplaint.complaint,
    department: localComplaint.department,
    status: localComplaint.status,
    priority: localComplaint.priority,
    assigned_to: localComplaint.assignedTo,
  }
}

const getAvatarFromName = (name: string): string => {
  const avatars = [
    "/thoughtful-man.png",
    "/diverse-woman-portrait.png",
    "/abstract-geometric-shapes.png"
  ];
  const hash = name?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
  return avatars[hash % avatars.length];
}