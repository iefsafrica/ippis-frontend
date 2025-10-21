/**
 * Database connection and utility functions
 *
 * This is a simplified example. In a real application, you would use:
 * - A proper ORM like Prisma or TypeORM
 * - Connection pooling
 * - Proper error handling and transactions
 */

import { neon } from "@neondatabase/serverless"
import { Pool } from "pg"
import type { Registration, VerificationData, PersonalInfo, EmploymentInfo, DocumentUploads } from "../types/database"

// Check that DATABASE_URL is set
const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set")
}

// Create a SQL query executor using neon (if you need it elsewhere)
const sqlClient = neon(connectionString)

// Create a connection pool for backward compatibility
const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

// Generate a unique registration ID
export async function generateRegistrationId(): Promise<string> {
  const prefix = "IPPIS"
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `${prefix}-${timestamp}-${random}`
}

// Create a new registration with better error handling and logs
export async function createRegistration(): Promise<Registration> {
  try {
    const registrationId = await generateRegistrationId()
    console.log("Generated registrationId:", registrationId)

    const query = `
      INSERT INTO registrations (registration_id, status, current_step)
      VALUES ($1, 'draft', 'verification')
      RETURNING *
    `

    const result = await pool.query(query, [registrationId])
    if (!result.rows || result.rows.length === 0) {
      throw new Error("Failed to create registration record")
    }

    console.log("Registration inserted:", result.rows[0])
    console.log("Loaded DATABASE_URL:", process.env.DATABASE_URL)


    // Add to history
    await pool.query(
      `INSERT INTO registration_history (registration_id, action, details) 
       VALUES ($1, 'created', 'Registration initiated')`,
      [registrationId],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Database error during registration creation:", error)
    throw error
  }
}

// Save verification data
export async function saveVerificationData(data: Partial<VerificationData>): Promise<VerificationData> {
  const { registrationId, bvn, bvnVerified, nin, ninVerified } = data

  const query = `
    INSERT INTO verification_data (registration_id, bvn, bvn_verified, nin, nin_verified, verification_date)
    VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
    ON CONFLICT (registration_id) 
    DO UPDATE SET 
      bvn = $2,
      bvn_verified = $3,
      nin = $4,
      nin_verified = $5,
      verification_date = CURRENT_TIMESTAMP
    RETURNING *
  `

  const result = await pool.query(query, [registrationId, bvn, bvnVerified, nin, ninVerified])

  if (bvnVerified && ninVerified) {
    await pool.query(`UPDATE registrations SET current_step = 'personal_info' WHERE registration_id = $1`, [
      registrationId,
    ])
  }

  return result.rows[0]
}

// Save personal information
export async function savePersonalInfo(data: Partial<PersonalInfo>): Promise<PersonalInfo> {
  const {
    registrationId,
    title,
    surname,
    firstName,
    otherNames,
    phoneNumber,
    email,
    dateOfBirth,
    sex,
    maritalStatus,
    stateOfOrigin,
    lga,
    stateOfResidence,
    addressStateOfResidence,
    nextOfKinName,
    nextOfKinRelationship,
    nextOfKinPhoneNumber,
    nextOfKinAddress,
  } = data

  const query = `
    INSERT INTO personal_info (
      registration_id, title, surname, first_name, other_names, phone_number, 
      email, date_of_birth, sex, marital_status, state_of_origin, lga, 
      state_of_residence, address_state_of_residence, next_of_kin_name, 
      next_of_kin_relationship, next_of_kin_phone_number, next_of_kin_address
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    ON CONFLICT (registration_id) 
    DO UPDATE SET 
      title = $2,
      surname = $3,
      first_name = $4,
      other_names = $5,
      phone_number = $6,
      email = $7,
      date_of_birth = $8,
      sex = $9,
      marital_status = $10,
      state_of_origin = $11,
      lga = $12,
      state_of_residence = $13,
      address_state_of_residence = $14,
      next_of_kin_name = $15,
      next_of_kin_relationship = $16,
      next_of_kin_phone_number = $17,
      next_of_kin_address = $18
    RETURNING *
  `

  const result = await pool.query(query, [
    registrationId,
    title,
    surname,
    firstName,
    otherNames,
    phoneNumber,
    email,
    dateOfBirth,
    sex,
    maritalStatus,
    stateOfOrigin,
    lga,
    stateOfResidence,
    addressStateOfResidence,
    nextOfKinName,
    nextOfKinRelationship,
    nextOfKinPhoneNumber,
    nextOfKinAddress,
  ])

  await pool.query(`UPDATE registrations SET current_step = 'employment_info' WHERE registration_id = $1`, [registrationId])

  return result.rows[0]
}

// Save employment information
export async function saveEmploymentInfo(data: Partial<EmploymentInfo>): Promise<EmploymentInfo> {
  const {
    registrationId,
    employmentIdNo,
    serviceNo,
    fileNo,
    rankPosition,
    department,
    organization,
    employmentType,
    probationPeriod,
    workLocation,
    dateOfFirstAppointment,
    gl,
    step,
    salaryStructure,
    cadre,
    nameOfBank,
    accountNumber,
    pfaName,
    rsapin,
    educationalBackground,
    certifications,
  } = data

  const query = `
    INSERT INTO employment_info (
      registration_id, employment_id_no, service_no, file_no, rank_position, department,
      organization, employment_type, probation_period, work_location, date_of_first_appointment,
      gl, step, salary_structure, cadre, name_of_bank, account_number, pfa_name, rsapin,
      educational_background, certifications
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
    ON CONFLICT (registration_id) 
    DO UPDATE SET 
      employment_id_no = $2,
      service_no = $3,
      file_no = $4,
      rank_position = $5,
      department = $6,
      organization = $7,
      employment_type = $8,
      probation_period = $9,
      work_location = $10,
      date_of_first_appointment = $11,
      gl = $12,
      step = $13,
      salary_structure = $14,
      cadre = $15,
      name_of_bank = $16,
      account_number = $17,
      pfa_name = $18,
      rsapin = $19,
      educational_background = $20,
      certifications = $21
    RETURNING *
  `

  const result = await pool.query(query, [
    registrationId,
    employmentIdNo,
    serviceNo,
    fileNo,
    rankPosition,
    department,
    organization,
    employmentType,
    probationPeriod,
    workLocation,
    dateOfFirstAppointment,
    gl,
    step,
    salaryStructure,
    cadre,
    nameOfBank,
    accountNumber,
    pfaName,
    rsapin,
    educationalBackground,
    certifications,
  ])

  await pool.query(`UPDATE registrations SET current_step = 'documents' WHERE registration_id = $1`, [registrationId])

  return result.rows[0]
}

// Save document uploads
export async function saveDocumentUploads(data: Partial<DocumentUploads>): Promise<DocumentUploads> {
  const {
    registrationId,
    appointmentLetterPath,
    educationalCertificatesPath,
    promotionLetterPath,
    otherDocumentsPath,
    profileImagePath,
    signaturePath,
  } = data

  const query = `
    INSERT INTO document_uploads (
      registration_id, appointment_letter_path, educational_certificates_path,
      promotion_letter_path, other_documents_path, profile_image_path, signature_path
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (registration_id) 
    DO UPDATE SET 
      appointment_letter_path = $2,
      educational_certificates_path = $3,
      promotion_letter_path = $4,
      other_documents_path = $5,
      profile_image_path = $6,
      signature_path = $7,
      upload_date = CURRENT_TIMESTAMP
    RETURNING *
  `

  const result = await pool.query(query, [
    registrationId,
    appointmentLetterPath,
    educationalCertificatesPath,
    promotionLetterPath,
    otherDocumentsPath,
    profileImagePath,
    signaturePath,
  ])

  await pool.query(`UPDATE registrations SET current_step = 'review' WHERE registration_id = $1`, [registrationId])

  return result.rows[0]
}

// Submit registration
export async function submitRegistration(registrationId: string, declaration: boolean): Promise<Registration> {
  const query = `
    UPDATE registrations 
    SET 
      status = 'pending_approval',
      current_step = 'submitted',
      declaration = $2,
      submitted_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE registration_id = $1
    RETURNING *
  `

  const result = await pool.query(query, [registrationId, declaration])

  await pool.query(
    `INSERT INTO registration_history (registration_id, action, details) 
     VALUES ($1, 'submitted', 'Registration submitted for approval')`,
    [registrationId],
  )

  return result.rows[0]
}

// Get complete registration data
export async function getRegistration(registrationId: string): Promise<any> {
  const registrationQuery = `SELECT * FROM registrations WHERE registration_id = $1`
  const verificationQuery = `SELECT * FROM verification_data WHERE registration_id = $1`
  const personalInfoQuery = `SELECT * FROM personal_info WHERE registration_id = $1`
  const employmentInfoQuery = `SELECT * FROM employment_info WHERE registration_id = $1`
  const documentsQuery = `SELECT * FROM document_uploads WHERE registration_id = $1`

  const [registrationResult, verificationResult, personalInfoResult, employmentInfoResult, documentsResult] =
    await Promise.all([
      pool.query(registrationQuery, [registrationId]),
      pool.query(verificationQuery, [registrationId]),
      pool.query(personalInfoQuery, [registrationId]),
      pool.query(employmentInfoQuery, [registrationId]),
      pool.query(documentsQuery, [registrationId]),
    ])

  return {
    registration: registrationResult.rows[0] || null,
    verification: verificationResult.rows[0] || null,
    personalInfo: personalInfoResult.rows[0] || null,
    employmentInfo: employmentInfoResult.rows[0] || null,
    documents: documentsResult.rows[0] || null,
  }
}

// Close the pool when the application shuts down
process.on("SIGINT", () => {
  pool.end()
  process.exit(0)
})

export { sqlClient, pool as db }

function generateId(prefix: string): string {
  return `${prefix}${Math.floor(10000 + Math.random() * 90000)}`
}

export { generateId }

// Add a query method to the db object if it doesn't exist
if (!("query" in pool)) {
  // @ts-ignore
  pool.query = pool.execute
}
