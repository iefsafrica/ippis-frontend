/**
 * Database schema definitions
 *
 * This file defines the database schema for the application.
 * In a real application, this would be used with an ORM like Prisma.
 * For this demo, it serves as documentation of the data structure.
 */

export interface VerificationData {
  bvn: string
  bvnVerified: boolean
  nin: string
  ninVerified: boolean
}

export interface PersonalInfo {
  title: string
  surname: string
  firstName: string
  otherNames?: string
  phoneNumber: string
  email: string
  dateOfBirth: string
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

export interface EmploymentInfo {
  employmentIdNo: string
  serviceNo: string
  fileNo: string
  rankPosition: string
  department: string
  organization: string
  employmentType: "Permanent" | "Contract" | "Temporary" | "Probationary"
  probationPeriod: "None" | "3 Months" | "6 Months" | "1 Year"
  workLocation: string
  dateOfFirstAppointment: string
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

export interface DocumentInfo {
  appointmentLetter: string // URL to the document
  educationalCertificates: string // URL to the document
  promotionLetter?: string // URL to the document
  otherDocuments?: string // URL to the document
  profileImage: string // URL to the image
  signature: string // URL to the image
}

export interface Registration {
  id: string
  registrationId: string
  verification: VerificationData
  personalInfo: PersonalInfo
  employmentInfo: EmploymentInfo
  documents: DocumentInfo
  declaration: boolean
  status: "draft" | "pending_approval" | "approved" | "rejected" | "incomplete"
  currentStep: "verification" | "personal_info" | "employment_info" | "documents" | "review" | "submitted"
  comments: Array<{
    text: string
    timestamp: string
    author?: string
  }>
  createdAt: string
  updatedAt: string
  submittedAt?: string
  approvedAt?: string
  rejectedAt?: string
}
