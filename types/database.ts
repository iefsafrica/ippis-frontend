/**
 * TypeScript types for the database schema
 */

// Step 1: Verification
export interface VerificationData {
  id: number
  registrationId: string
  bvn: string
  bvnVerified: boolean
  nin: string
  ninVerified: boolean
  verificationDate: Date | null
}

// Step 2: Personal Information
export interface PersonalInfo {
  id: number
  registrationId: string
  title: string
  surname: string
  firstName: string
  otherNames?: string
  phoneNumber: string
  email: string
  dateOfBirth: Date
  sex: "Male" | "Female"
  maritalStatus: "Single" | "Married" | "Divorced" | "Widowed"
  stateOfOrigin: string
  lga: string
  stateOfResidence: string
  addressStateOfResidence: string
  nextOfKinName: string
  nextOfKinRelationship: string
  nextOfKinPhoneNumber: string
  nextOfKinAddress: string
}

// Step 3: Employment Information
export interface EmploymentInfo {
  id: number
  registrationId: string
  employmentIdNo: string
  serviceNo: string
  fileNo: string
  rankPosition: string
  department: string
  organization: string
  employmentType: "Permanent" | "Contract" | "Temporary" | "Probationary"
  probationPeriod: "None" | "3 Months" | "6 Months" | "1 Year"
  workLocation: string
  dateOfFirstAppointment: Date
  gl: string
  step: string
  salaryStructure: string
  cadre: string
  nameOfBank: string
  accountNumber: string
  pfaName: string
  rsapin: string
  educationalBackground?: string
  certifications?: string
}

// Step 4: Document Upload
export interface DocumentUploads {
  id: number
  registrationId: string
  appointmentLetterPath: string
  educationalCertificatesPath: string
  promotionLetterPath?: string
  otherDocumentsPath?: string
  profileImagePath: string
  signaturePath: string
  uploadDate: Date
}

// Main Registration
export interface Registration {
  id: number
  registrationId: string
  status: "draft" | "pending_approval" | "approved" | "rejected" | "incomplete"
  currentStep: "verification" | "personal_info" | "employment_info" | "documents" | "review" | "submitted"
  declaration: boolean
  createdAt: Date
  updatedAt: Date
  submittedAt?: Date
  approvedAt?: Date
  rejectedAt?: Date
}

// Comments
export interface RegistrationComment {
  id: number
  registrationId: string
  commentText: string
  author?: string
  createdAt: Date
}

// History/Audit Trail
export interface RegistrationHistory {
  id: number
  registrationId: string
  action: string
  details?: string
  performedBy?: string
  performedAt: Date
}
