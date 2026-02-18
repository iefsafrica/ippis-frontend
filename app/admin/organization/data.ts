export type OrganizationStatus = "active" | "inactive"

export interface OrganizationRecord {
  id: string
  name: string
  code: string
  description: string
  status: OrganizationStatus
  createdDate: string
}

export const companyData: OrganizationRecord[] = [
  { id: "1", name: "IPPIS HQ", code: "COMP-001", description: "Headquarters company profile", status: "active", createdDate: "2026-01-10" },
  { id: "2", name: "IPPIS Services", code: "COMP-002", description: "Shared services company", status: "active", createdDate: "2026-01-08" },
  { id: "3", name: "IPPIS Projects", code: "COMP-003", description: "Project delivery company record", status: "inactive", createdDate: "2025-12-20" },
  { id: "4", name: "IPPIS Regional", code: "COMP-004", description: "Regional operations entity", status: "active", createdDate: "2025-12-12" },
]

export const departmentData: OrganizationRecord[] = [
  { id: "1", name: "Human Resources", code: "DEPT-HR", description: "People operations and policy", status: "active", createdDate: "2026-01-05" },
  { id: "2", name: "Finance", code: "DEPT-FIN", description: "Budgeting and accounting", status: "active", createdDate: "2026-01-01" },
  { id: "3", name: "Information Technology", code: "DEPT-IT", description: "Systems and infrastructure", status: "active", createdDate: "2025-12-26" },
  { id: "4", name: "Legal", code: "DEPT-LGL", description: "Compliance and legal affairs", status: "inactive", createdDate: "2025-12-01" },
]

export const locationData: OrganizationRecord[] = [
  { id: "1", name: "Abuja - HQ", code: "LOC-ABJ", description: "Main administrative office", status: "active", createdDate: "2026-01-03" },
  { id: "2", name: "Lagos Office", code: "LOC-LAG", description: "Southwest operational office", status: "active", createdDate: "2025-12-29" },
  { id: "3", name: "Kano Office", code: "LOC-KAN", description: "Northern support center", status: "active", createdDate: "2025-12-10" },
  { id: "4", name: "Port Harcourt Office", code: "LOC-PHC", description: "South-south regional office", status: "inactive", createdDate: "2025-11-22" },
]

export const designationData: OrganizationRecord[] = [
  { id: "1", name: "HR Manager", code: "DES-001", description: "Leads HR operations", status: "active", createdDate: "2026-01-06" },
  { id: "2", name: "Finance Officer", code: "DES-002", description: "Handles accounting workflows", status: "active", createdDate: "2025-12-31" },
  { id: "3", name: "Systems Analyst", code: "DES-003", description: "Analyzes and improves systems", status: "active", createdDate: "2025-12-14" },
  { id: "4", name: "Administrative Assistant", code: "DES-004", description: "Supports office administration", status: "inactive", createdDate: "2025-11-30" },
]

export const announcementsData: OrganizationRecord[] = [
  { id: "1", name: "Q1 Town Hall", code: "ANN-001", description: "Company-wide town hall announcement", status: "active", createdDate: "2026-01-12" },
  { id: "2", name: "Leave Policy Update", code: "ANN-002", description: "Update on annual leave process", status: "active", createdDate: "2026-01-04" },
  { id: "3", name: "Security Reminder", code: "ANN-003", description: "Password and account security reminder", status: "active", createdDate: "2025-12-18" },
  { id: "4", name: "Maintenance Window", code: "ANN-004", description: "Scheduled system maintenance notice", status: "inactive", createdDate: "2025-12-03" },
]

export const companyPolicyData: OrganizationRecord[] = [
  { id: "1", name: "Code of Conduct", code: "POL-001", description: "Staff conduct standards policy", status: "active", createdDate: "2026-01-09" },
  { id: "2", name: "Remote Work Policy", code: "POL-002", description: "Guidelines for remote work arrangements", status: "active", createdDate: "2026-01-02" },
  { id: "3", name: "Data Protection Policy", code: "POL-003", description: "Data privacy and handling standards", status: "active", createdDate: "2025-12-16" },
  { id: "4", name: "Travel Policy", code: "POL-004", description: "Official travel and reimbursement rules", status: "inactive", createdDate: "2025-11-27" },
]
