"use client"

import React, { useRef } from "react"
import Image from "next/image"
import { QRCodeSVG } from "qrcode.react"
import { Printer, Download, X, ShieldCheck, CheckCircle2, User, Building2, CreditCard, Users2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export interface RegistrationSlipData {
  registrationId: string
  registrationDate?: string | null
  status?: string | null

  // Personal Info
  title?: string | null
  surname: string
  firstName: string
  otherNames?: string | null
  nin?: string | null
  bvn?: string | null
  email?: string | null
  phoneNumber?: string | null
  dateOfBirth?: string | null
  gender?: string | null
  maritalStatus?: string | null
  stateOfOrigin?: string | null
  lga?: string | null
  stateOfResidence?: string | null
  residentialAddress?: string | null

  // Employment Info
  department?: string | null
  organization?: string | null
  cadre?: string | null
  position?: string | null
  gradeLevel?: string | null
  step?: string | null
  salaryStructure?: string | null
  employmentType?: string | null
  employmentId?: string | null
  serviceNumber?: string | null
  fileNumber?: string | null
  dateOfFirstAppointment?: string | null
  workLocation?: string | null
  probationPeriod?: string | null

  // Payroll & Pension
  bankName?: string | null
  accountNumber?: string | null
  pfaName?: string | null
  rsaPin?: string | null

  // Next of Kin
  nextOfKinName?: string | null
  nextOfKinRelationship?: string | null
  nextOfKinPhoneNumber?: string | null
  nextOfKinAddress?: string | null

  // Media
  profileImageUrl?: string | null
  signatureUrl?: string | null
}

interface RegistrationSlipProps {
  data: RegistrationSlipData
  onClose?: () => void
  showActions?: boolean
}

const formatDateDisplay = (value?: string | null) => {
  if (!value) return "N/A"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

export function buildSlipDataFromFormData(
  formData: any,
  registrationId: string,
  profilePreviewSrc?: string,
  signaturePreviewSrc?: string,
): RegistrationSlipData {
  return {
    registrationId,
    registrationDate: new Date().toISOString(),
    status: "submitted",
    title: formData.title,
    surname: formData.surname || "",
    firstName: formData.firstName || "",
    otherNames: formData.otherNames || "",
    nin: formData.nin,
    bvn: formData.bvn,
    email: formData.email,
    phoneNumber: formData.phoneNumber,
    dateOfBirth: formData.dateOfBirth,
    gender: formData.sex || formData.gender,
    maritalStatus: formData.maritalStatus,
    stateOfOrigin: formData.stateOfOrigin,
    lga: formData.lga,
    stateOfResidence: formData.stateOfResidence,
    residentialAddress: formData.addressStateOfResidence || formData.residentialAddress,
    department: formData.department,
    organization: formData.organization,
    cadre: formData.cadre,
    position: formData.position || formData.rankPosition,
    gradeLevel: formData.gl || formData.gradeLevel,
    step: formData.step,
    salaryStructure: formData.salaryStructure,
    employmentType: formData.employmentType,
    employmentId: formData.employmentId,
    serviceNumber: formData.serviceNumber,
    fileNumber: formData.fileNumber,
    dateOfFirstAppointment: formData.dateOfFirstAppointment,
    workLocation: formData.workLocation,
    probationPeriod: formData.probationPeriod,
    bankName: formData.nameOfBank || formData.bankName,
    accountNumber: formData.accountNumber,
    pfaName: formData.pfaName,
    rsaPin: formData.rsapin || formData.rsaPin,
    nextOfKinName: formData.nextOfKinName,
    nextOfKinRelationship: formData.nextOfKinRelationship,
    nextOfKinPhoneNumber: formData.nextOfKinPhoneNumber,
    nextOfKinAddress: formData.nextOfKinAddress,
    profileImageUrl: profilePreviewSrc || (typeof formData.profileImage === "string" ? formData.profileImage : null),
    signatureUrl: signaturePreviewSrc || (typeof formData.signature === "string" ? formData.signature : null),
  }
}

export function buildSlipDataFromTrackBundle(
  bundleOrRecord: any,
  fallbackRegistrationId?: string,
): RegistrationSlipData {
  const reg = bundleOrRecord?.registration || {}
  const pers = bundleOrRecord?.personal || {}
  const emp = bundleOrRecord?.employment || {}
  const ver = bundleOrRecord?.verification || {}
  const doc = bundleOrRecord?.documents || {}
  const meta = typeof bundleOrRecord?.metadata === "object" ? bundleOrRecord?.metadata : {}

  const regId =
    reg.registration_id ||
    bundleOrRecord?.registration_id ||
    pers.registration_id ||
    emp.registration_id ||
    fallbackRegistrationId ||
    "IPPIS-0000"

  const surname = pers.surname || ver.surname || bundleOrRecord?.surname || ""
  const firstName =
    pers.first_name ||
    pers.firstname ||
    ver.first_name ||
    ver.firstname ||
    bundleOrRecord?.firstname ||
    bundleOrRecord?.first_name ||
    ""
  const otherNames = pers.other_names || ver.middlename || bundleOrRecord?.middlename || ""

  return {
    registrationId: regId,
    registrationDate:
      reg.submitted_at || reg.created_at || bundleOrRecord?.submission_date || bundleOrRecord?.created_at,
    status: reg.status || bundleOrRecord?.status || "pending_approval",
    title: pers.title || ver.title || meta?.title,
    surname,
    firstName,
    otherNames,
    nin: ver.nin || reg.nin || bundleOrRecord?.nin || meta?.nin,
    bvn: ver.bvn || bundleOrRecord?.bvn || meta?.bvn,
    email: pers.email || ver.email || bundleOrRecord?.email,
    phoneNumber: pers.phone_number || ver.telephoneno || bundleOrRecord?.telephoneno || bundleOrRecord?.phone,
    dateOfBirth: pers.date_of_birth || ver.birthdate || bundleOrRecord?.birthdate,
    gender: pers.sex || ver.gender || bundleOrRecord?.gender,
    maritalStatus: pers.marital_status || ver.maritalstatus || bundleOrRecord?.maritalstatus,
    stateOfOrigin: pers.state_of_origin || ver.state_of_origin || bundleOrRecord?.state_of_origin,
    lga: pers.lga || ver.residence_lga || bundleOrRecord?.residence_lga,
    stateOfResidence: pers.state_of_residence || ver.residence_state || bundleOrRecord?.residence_state,
    residentialAddress: pers.address_state_of_residence || ver.residence_address || bundleOrRecord?.residence_address,
    department: emp.department || pers.department || bundleOrRecord?.department,
    organization: emp.organization || bundleOrRecord?.organization,
    cadre: emp.cadre || bundleOrRecord?.cadre,
    position: emp.rank_position || emp.position || pers.position || bundleOrRecord?.position,
    gradeLevel: emp.gl || emp.grade_level || bundleOrRecord?.grade_level,
    step: emp.step || bundleOrRecord?.step,
    salaryStructure: emp.salary_structure || bundleOrRecord?.salary_structure,
    employmentType: emp.employment_type || bundleOrRecord?.employment_type,
    employmentId: emp.employment_id_no || bundleOrRecord?.employment_id_no,
    serviceNumber: emp.service_no || bundleOrRecord?.service_no,
    fileNumber: emp.file_no || bundleOrRecord?.file_no,
    dateOfFirstAppointment: emp.date_of_first_appointment || bundleOrRecord?.date_of_first_appointment,
    workLocation: emp.work_location || bundleOrRecord?.work_location,
    probationPeriod: emp.probation_period || bundleOrRecord?.probation_period,
    bankName: emp.name_of_bank || emp.bank_name || bundleOrRecord?.bank_name,
    accountNumber: emp.account_number || bundleOrRecord?.account_number,
    pfaName: emp.pfa_name || bundleOrRecord?.pfa_name,
    rsaPin: emp.rsapin || bundleOrRecord?.rsapin,
    nextOfKinName: pers.next_of_kin_name || bundleOrRecord?.next_of_kin_name,
    nextOfKinRelationship: pers.next_of_kin_relationship || bundleOrRecord?.next_of_kin_relationship,
    nextOfKinPhoneNumber: pers.next_of_kin_phone_number || bundleOrRecord?.next_of_kin_phone_number,
    nextOfKinAddress: pers.next_of_kin_address || bundleOrRecord?.next_of_kin_address,
    profileImageUrl: doc.profile_image_path || ver.photo,
    signatureUrl: doc.signature_path || ver.signature,
  }
}


export function generateFallbackSlipHtml(data: RegistrationSlipData): string {
  const regId = data.registrationId || "IPPIS"
  const fullName = `${data.surname?.toUpperCase() || ""}, ${data.firstName || ""} ${data.otherNames || ""}`.trim() || "Applicant"
  const origin = typeof window !== "undefined" ? window.location.origin : "https://ippis.gov.ng"
  const verifyUrl = `${origin}/track?id=${encodeURIComponent(regId)}`
  const qrImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(verifyUrl)}`

  return `
    <header style="border-bottom: 2px solid #065f46; padding-bottom: 16px; text-align: center;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="text-align: left;">
          <span style="font-size: 10px; font-weight: bold; color: #64748b; display: block; text-transform: uppercase;">Ref No:</span>
          <span style="font-size: 12px; font-family: monospace; font-weight: bold; color: #1e293b;">${regId}</span>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center;">
          <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Coat_of_arms_of_Nigeria.svg-IFrFqiae8fXtNsVx4Ip0AeHFPjj7Mp.png" alt="Coat of Arms of Nigeria" style="height: 60px; width: auto; margin-bottom: 4px;" />
          <h1 style="font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #020617; font-family: 'Libre Baskerville', Georgia, serif; margin: 0;">Federal Republic of Nigeria</h1>
          <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #064e3b; margin: 2px 0;">Office of the Accountant-General of the Federation</h2>
          <p style="font-size: 11px; font-weight: 600; color: #334155; margin: 0;">Integrated Personnel and Payroll Information System (IPPIS)</p>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 10px; font-weight: bold; color: #64748b; display: block; text-transform: uppercase;">Status:</span>
          <span style="background: #d1fae5; color: #065f46; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase;">${(data.status || "Submitted").replace(/_/g, " ")}</span>
        </div>
      </div>
      <div style="margin-top: 10px; display: inline-block; background: #065f46; color: #ffffff; padding: 4px 16px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em;">
        Official Employee Registration Slip
      </div>
    </header>

    <!-- Top Banner -->
    <div style="margin: 16px 0; display: grid; grid-template-columns: 120px 1fr 140px; gap: 16px; align-items: center; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; background: #f8fafc;">
      <div style="text-align: center;">
        <div style="height: 120px; width: 105px; border: 2px solid #064e3b; border-radius: 4px; overflow: hidden; background: #e2e8f0; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
          ${data.profileImageUrl ? `<img src="${data.profileImageUrl}" alt="Passport Photo" style="width: 100%; height: 100%; object-fit: cover;" />` : `<span style="font-size: 10px; font-weight: bold; color: #64748b;">PASSPORT</span>`}
        </div>
        <span style="font-size: 9px; font-weight: bold; text-transform: uppercase; color: #475569; display: block; margin-top: 4px;">Passport Photo</span>
      </div>

      <div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #64748b;">Enrolment ID:</span>
          <span style="background: #064e3b; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-family: monospace; font-size: 13px; font-weight: 800;">${regId}</span>
        </div>
        <div style="font-size: 16px; font-weight: 800; color: #020617; text-transform: uppercase; margin: 4px 0;">${fullName}</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 6px;">
          <div><strong style="color: #64748b; font-size: 10px; text-transform: uppercase; display: block;">NIN:</strong> ${data.nin || "—"}</div>
          <div><strong style="color: #64748b; font-size: 10px; text-transform: uppercase; display: block;">BVN:</strong> ${data.bvn || "—"}</div>
          <div><strong style="color: #64748b; font-size: 10px; text-transform: uppercase; display: block;">Department:</strong> ${data.department || data.organization || "—"}</div>
          <div><strong style="color: #64748b; font-size: 10px; text-transform: uppercase; display: block;">Submitted:</strong> ${formatDateDisplay(data.registrationDate)}</div>
        </div>
      </div>

      <div style="text-align: center; border-left: 1px solid #e2e8f0; padding-left: 12px;">
        <div style="padding: 6px; background: #ffffff; border: 2px solid #0f172a; border-radius: 4px; display: inline-block;">
          <img src="${qrImgSrc}" alt="Scan Code" style="width: 88px; height: 88px; display: block;" />
        </div>
        <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #064e3b; display: block; margin-top: 4px;">Official Scan Code</span>
        <span style="font-size: 8px; color: #64748b; display: block;">Scan to verify authentication</span>
      </div>
    </div>

    <!-- 1. Bio-Data -->
    <div style="margin-bottom: 14px;">
      <div style="background: #064e3b; color: #ffffff; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
        1. Personal Bio-Data
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 4px;">
        <tbody>
          <tr>
            <td style="width: 25%; background: #f8fafc; font-weight: 600; color: #475569;">Full Name:</td>
            <td style="width: 25%; font-weight: 700; color: #020617;">${fullName}</td>
            <td style="width: 25%; background: #f8fafc; font-weight: 600; color: #475569;">Gender:</td>
            <td style="width: 25%;">${data.gender || "—"}</td>
          </tr>
          <tr>
            <td style="background: #f8fafc; font-weight: 600; color: #475569;">Date of Birth:</td>
            <td>${formatDateDisplay(data.dateOfBirth)}</td>
            <td style="background: #f8fafc; font-weight: 600; color: #475569;">Marital Status:</td>
            <td>${data.maritalStatus || "—"}</td>
          </tr>
          <tr>
            <td style="background: #f8fafc; font-weight: 600; color: #475569;">Phone Number:</td>
            <td>${data.phoneNumber || "—"}</td>
            <td style="background: #f8fafc; font-weight: 600; color: #475569;">Email Address:</td>
            <td>${data.email || "—"}</td>
          </tr>
          <tr>
            <td style="background: #f8fafc; font-weight: 600; color: #475569;">State / LGA:</td>
            <td>${data.stateOfOrigin ? `${data.stateOfOrigin} / ${data.lga || "—"}` : "—"}</td>
            <td style="background: #f8fafc; font-weight: 600; color: #475569;">State of Residence:</td>
            <td>${data.stateOfResidence || "—"}</td>
          </tr>
          <tr>
            <td style="background: #f8fafc; font-weight: 600; color: #475569;">Residential Address:</td>
            <td colspan="3">${data.residentialAddress || "—"}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 2. Employment Details -->
    <div style="margin-bottom: 14px;">
      <div style="background: #064e3b; color: #ffffff; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
        2. Employment & Cadre Details
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 4px;">
        <tbody>
          <tr>
            <td style="width: 25%; background: #f8fafc; font-weight: 600; color: #475569;">MDA / Ministry:</td>
            <td style="width: 25%; font-weight: 700; color: #020617;">${data.department || data.organization || "—"}</td>
            <td style="width: 25%; background: #f8fafc; font-weight: 600; color: #475569;">Cadre / Position:</td>
            <td style="width: 25%;">${data.cadre || data.position || "—"}</td>
          </tr>
          <tr>
            <td style="background: #f8fafc; font-weight: 600; color: #475569;">Grade Level / Step:</td>
            <td>${data.gradeLevel ? `GL ${data.gradeLevel}` : "—"} ${data.step ? `/ Step ${data.step}` : ""}</td>
            <td style="background: #f8fafc; font-weight: 600; color: #475569;">Salary Structure:</td>
            <td>${data.salaryStructure || "CONPSS"}</td>
          </tr>
          <tr>
            <td style="background: #f8fafc; font-weight: 600; color: #475569;">Employment ID:</td>
            <td>${data.employmentId || "—"}</td>
            <td style="background: #f8fafc; font-weight: 600; color: #475569;">Employment Type:</td>
            <td>${data.employmentType || "Permanent"}</td>
          </tr>
          <tr>
            <td style="background: #f8fafc; font-weight: 600; color: #475569;">Service / File No:</td>
            <td>${data.serviceNumber || "—"} / ${data.fileNumber || "—"}</td>
            <td style="background: #f8fafc; font-weight: 600; color: #475569;">Work Location:</td>
            <td>${data.workLocation || "—"}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 3. Payroll & Pension -->
    <div style="margin-bottom: 14px;">
      <div style="background: #064e3b; color: #ffffff; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
        3. Payroll, Bank & Pension Details
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 4px;">
        <tbody>
          <tr>
            <td style="width: 25%; background: #f8fafc; font-weight: 600; color: #475569;">Bank Name:</td>
            <td style="width: 25%; font-weight: 700; color: #020617;">${data.bankName || "—"}</td>
            <td style="width: 25%; background: #f8fafc; font-weight: 600; color: #475569;">Account Number:</td>
            <td style="width: 25%; font-family: monospace; font-weight: 700;">${data.accountNumber || "—"}</td>
          </tr>
          <tr>
            <td style="background: #f8fafc; font-weight: 600; color: #475569;">PFA Name:</td>
            <td>${data.pfaName || "—"}</td>
            <td style="background: #f8fafc; font-weight: 600; color: #475569;">RSA PIN:</td>
            <td style="font-family: monospace; font-weight: 700;">${data.rsaPin || "—"}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 4. Next of Kin -->
    <div style="margin-bottom: 14px;">
      <div style="background: #064e3b; color: #ffffff; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
        4. Next of Kin Information
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 4px;">
        <tbody>
          <tr>
            <td style="width: 25%; background: #f8fafc; font-weight: 600; color: #475569;">Next of Kin Name:</td>
            <td style="width: 25%; font-weight: 700; color: #020617;">${data.nextOfKinName || "—"}</td>
            <td style="width: 25%; background: #f8fafc; font-weight: 600; color: #475569;">Relationship:</td>
            <td style="width: 25%;">${data.nextOfKinRelationship || "—"}</td>
          </tr>
          <tr>
            <td style="background: #f8fafc; font-weight: 600; color: #475569;">Phone Number:</td>
            <td>${data.nextOfKinPhoneNumber || "—"}</td>
            <td style="background: #f8fafc; font-weight: 600; color: #475569;">Address:</td>
            <td>${data.nextOfKinAddress || "—"}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Attestation -->
    <div style="border: 1px solid #fcd34d; background: #fffbeb; padding: 8px 12px; border-radius: 4px; font-size: 10px; color: #1e293b; margin-bottom: 14px;">
      <strong style="color: #78350f; text-transform: uppercase; display: block; margin-bottom: 2px;">Solemn Declaration & Enrolment Attestation:</strong>
      I hereby certify that the information provided on this registration slip is true, complete, and verifiable. I understand that any false declaration or forged document constitutes gross misconduct under the Public Service Rules and attracts immediate disqualification, cancellation of enrolment, and legal prosecution under the laws of the Federal Republic of Nigeria.
    </div>

    <!-- 3 Mandatory Signatures -->
    <div style="border: 2px solid #0f172a; border-radius: 6px; padding: 12px; background: #f8fafc;">
      <div style="text-align: center; margin-bottom: 10px;">
        <h3 style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #020617; margin: 0;">Signatures & Official Endorsements</h3>
        <p style="font-size: 9px; color: #475569; margin: 2px 0 0 0;">This slip requires the following three authorized endorsements to be valid for final IPPIS payroll inclusion:</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
        <!-- i. Employee Signature -->
        <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 10px; text-align: center; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <span style="display: inline-block; background: #f1f5f9; color: #1e293b; font-size: 9px; font-weight: bold; text-transform: uppercase; padding: 2px 6px; border-radius: 3px; margin-bottom: 6px;">i. Employee Signature</span>
            <div style="height: 52px; display: flex; align-items: center; justify-content: center; border: 1px dashed #cbd5e1; border-radius: 4px; background: #f8fafc; margin-bottom: 6px;">
              ${data.signatureUrl ? `<img src="${data.signatureUrl}" alt="Signature" style="max-height: 48px; max-width: 120px; object-fit: contain;" />` : `<span style="font-size: 9px; color: #94a3b8; font-family: monospace;">[ Signed Digitally ]</span>`}
            </div>
          </div>
          <div>
            <div style="border-bottom: 2px solid #0f172a; margin-bottom: 4px;"></div>
            <p style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #020617; margin: 0;">${fullName}</p>
            <p style="font-size: 8px; color: #64748b; text-transform: uppercase; margin: 1px 0 0 0;">Signature of Employee</p>
            <p style="font-size: 9px; color: #475569; font-family: monospace; margin: 2px 0 0 0;">Date: ${formatDateDisplay(data.registrationDate)}</p>
          </div>
        </div>

        <!-- ii. Deputy Director Signature -->
        <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 4px; padding: 10px; text-align: center; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <span style="display: inline-block; background: #dcfce7; color: #14532d; font-size: 9px; font-weight: bold; text-transform: uppercase; padding: 2px 6px; border-radius: 3px; margin-bottom: 6px;">ii. Deputy Director Signature</span>
            <div style="height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px dashed #4ade80; border-radius: 4px; background: #dcfce7; margin-bottom: 6px; padding: 2px;">
              <span style="font-size: 8px; font-weight: 800; text-transform: uppercase; color: #14532d;">★ VERIFIED & RECOMMENDED ★</span>
              <span style="font-size: 8px; color: #166534;">IPPIS Enrolment Division</span>
            </div>
          </div>
          <div>
            <div style="border-bottom: 2px solid #0f172a; margin-bottom: 4px;"></div>
            <p style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #020617; margin: 0;">Deputy Director (IPPIS)</p>
            <p style="font-size: 8px; color: #64748b; text-transform: uppercase; margin: 1px 0 0 0;">Enrolment & Payroll Operations</p>
            <p style="font-size: 9px; color: #475569; font-family: monospace; margin: 2px 0 0 0;">Date: ${formatDateDisplay(data.registrationDate)}</p>
          </div>
        </div>

        <!-- iii. Directors Signature -->
        <div style="background: #ecfdf5; border: 1px solid #059669; border-radius: 4px; padding: 10px; text-align: center; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <span style="display: inline-block; background: #065f46; color: #ffffff; font-size: 9px; font-weight: bold; text-transform: uppercase; padding: 2px 6px; border-radius: 3px; margin-bottom: 6px;">iii. Director's Signature</span>
            <div style="height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2px solid #065f46; border-radius: 4px; background: #d1fae5; margin-bottom: 6px; padding: 2px;">
              <span style="font-size: 8px; font-weight: 800; text-transform: uppercase; color: #064e3b;">★ EXECUTIVE SEAL & APPROVAL ★</span>
              <span style="font-size: 8px; color: #047857;">OAGF • Federal Republic of Nigeria</span>
            </div>
          </div>
          <div>
            <div style="border-bottom: 2px solid #0f172a; margin-bottom: 4px;"></div>
            <p style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #020617; margin: 0;">Director, IPPIS</p>
            <p style="font-size: 8px; color: #64748b; text-transform: uppercase; margin: 1px 0 0 0;">Office of the Accountant-General</p>
            <p style="font-size: 9px; color: #475569; font-family: monospace; margin: 2px 0 0 0;">Date: ${formatDateDisplay(data.registrationDate)}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer style="margin-top: 14px; padding-top: 10px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 9px; color: #64748b;">
      <div><strong>SECURITY NOTICE:</strong> Official Government Document. Unauthorized alteration is punishable under the Penal Code.</div>
      <div style="font-family: monospace;">IPPIS Ref: ${regId} • Scan Code to Verify</div>
    </footer>
  `
}

export function downloadSlipDocument(data: RegistrationSlipData, element?: HTMLElement | null) {
  if (typeof window === "undefined") return

  const slipElement = element || document.getElementById("ippis-registration-slip")
  let slipHtml = slipElement ? slipElement.innerHTML : ""
  if (!slipHtml || slipHtml.trim().length === 0) {
    slipHtml = generateFallbackSlipHtml(data)
  }
  const regId = data.registrationId || "IPPIS"

  const htmlDocument = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IPPIS Registration Slip - ${regId}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Libre+Baskerville:wght@700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; padding: 24px 12px; }
    .slip-wrapper { max-width: 900px; margin: 0 auto; background: #ffffff; padding: 32px; border: 2px solid #064e3b; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); position: relative; }
    .action-bar { max-width: 900px; margin: 0 auto 16px auto; display: flex; justify-content: flex-end; gap: 10px; }
    .btn { background: #047857; color: #ffffff; border: none; padding: 10px 18px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; display: inline-flex; align-items: center; gap: 8px; }
    .btn:hover { background: #065f46; }
    .btn-secondary { background: #475569; }
    .btn-secondary:hover { background: #334155; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 6px; }
    table, th, td { border: 1px solid #cbd5e1; }
    td { padding: 6px 8px; }
    .payslip-serif { font-family: 'Libre Baskerville', Georgia, serif; }
    @media print {
      @page { size: A4 portrait; margin: 6mm; }
      body { background: #ffffff !important; padding: 0 !important; }
      .action-bar { display: none !important; }
      .slip-wrapper { border: 2px solid #064e3b !important; box-shadow: none !important; padding: 4mm !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; }
    }
  </style>
</head>
<body>
  <div class="action-bar">
    <button class="btn" onclick="window.print()">Print / Save as PDF</button>
  </div>
  <div class="slip-wrapper">
    ${slipHtml}
  </div>
</body>
</html>`

  const blob = new Blob([htmlDocument], { type: "text/html;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `IPPIS-Registration-Slip-${regId}.html`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export function RegistrationSlip({ data, onClose, showActions = true }: RegistrationSlipProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const fullName = `${data.surname?.toUpperCase() || ""}, ${data.firstName || ""} ${data.otherNames || ""}`.trim()
  const origin = typeof window !== "undefined" ? window.location.origin : "https://ippis.gov.ng"
  const verifyUrl = `${origin}/track?id=${encodeURIComponent(data.registrationId)}`

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    downloadSlipDocument(data, printRef.current)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Action Header (Hidden in Print) */}
      {showActions && (
        <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-700" />
            <span className="text-sm font-semibold text-emerald-900">
              Official IPPIS Registration Slip • Verified Record
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handlePrint}
              className="bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm gap-2"
              size="sm"
            >
              <Printer className="h-4 w-4" />
              Print Registration Slip
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="border-emerald-700 text-emerald-800 hover:bg-emerald-100 shadow-sm gap-2"
              size="sm"
            >
              <Download className="h-4 w-4" />
              Download Slip
            </Button>
            {onClose && (
              <Button onClick={onClose} variant="ghost" size="sm" className="gap-1 text-slate-600 hover:text-slate-900">
                <X className="h-4 w-4" />
                Close
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Printable Slip Container */}
      <div
        id="ippis-registration-slip"
        ref={printRef}
        className="relative bg-white text-slate-900 p-6 sm:p-8 rounded-lg border-2 border-emerald-900/40 shadow-md print:border-0 print:shadow-none print:p-4 print:m-0"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Subtle Watermark for Official Print */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03] select-none"
        >
          <span className="text-8xl font-black uppercase text-slate-900 rotate-[-30deg]">
            IPPIS NIGERIA
          </span>
        </div>

        {/* 1. Header Section */}
        <header className="border-b-2 border-emerald-800/80 pb-4 text-center">
          <div className="flex items-center justify-between">
            <div className="w-20 text-left">
              <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Ref No:</span>
              <span className="text-xs font-mono font-bold text-slate-800">{data.registrationId}</span>
            </div>

            <div className="flex flex-col items-center">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Coat_of_arms_of_Nigeria.svg-IFrFqiae8fXtNsVx4Ip0AeHFPjj7Mp.png"
                alt="Coat of Arms of Nigeria"
                width={65}
                height={65}
                className="h-16 w-auto object-contain mb-1"
                priority
              />
              <h1 className="text-lg sm:text-xl font-extrabold uppercase tracking-[0.18em] text-slate-950 payslip-serif">
                Federal Republic of Nigeria
              </h1>
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-900">
                Office of the Accountant-General of the Federation
              </h2>
              <p className="text-[11px] font-semibold text-slate-700 tracking-wide">
                Integrated Personnel and Payroll Information System (IPPIS)
              </p>
            </div>

            <div className="w-20 text-right">
              <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Status:</span>
              <span className="inline-block rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                {data.status ? data.status.replace(/_/g, " ") : "Submitted"}
              </span>
            </div>
          </div>

          <div className="mt-3 inline-block rounded-md bg-emerald-800 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white">
            Official Employee Registration Slip
          </div>
        </header>

        {/* 2. Top Banner: Photo, Credentials & Scan Code */}
        <section className="my-5 grid grid-cols-1 md:grid-cols-[130px_1fr_150px] gap-4 items-center border border-slate-200 rounded-lg p-3 bg-slate-50/50 print:bg-transparent">
          {/* Passport Photo */}
          <div className="flex flex-col items-center">
            <div className="h-32 w-28 rounded border-2 border-emerald-900/30 overflow-hidden bg-slate-100 flex items-center justify-center relative shadow-sm">
              {data.profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.profileImageUrl}
                  alt="Employee Passport"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <User className="h-12 w-12" />
                  <span className="text-[9px] uppercase font-bold text-slate-500 mt-1">Photo</span>
                </div>
              )}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 mt-1">
              Passport Photo
            </span>
          </div>

          {/* Core Employee Identification */}
          <div className="space-y-1.5 px-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Enrolment ID:</span>
              <span className="rounded bg-emerald-900 text-white px-2 py-0.5 font-mono text-sm font-black tracking-wider">
                {data.registrationId}
              </span>
            </div>

            <div className="text-base sm:text-lg font-black text-slate-950 uppercase tracking-tight">
              {fullName || "N/A"}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200">
              <div>
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">NIN (Identity No.)</span>
                <span className="font-mono font-bold text-slate-900">{data.nin || "—"}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">BVN (Bank Verification)</span>
                <span className="font-mono font-bold text-slate-900">{data.bvn || "—"}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Department / Ministry</span>
                <span className="font-semibold text-slate-900">{data.department || data.organization || "—"}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Submission Date</span>
                <span className="font-semibold text-slate-900">{formatDateDisplay(data.registrationDate)}</span>
              </div>
            </div>
          </div>

          {/* Scan Code (QR Code) */}
          <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-200 pl-0 md:pl-3 pt-3 md:pt-0">
            <div className="p-1.5 bg-white border-2 border-slate-800 rounded shadow-sm">
              <QRCodeSVG
                value={verifyUrl}
                size={96}
                level="M"
                includeMargin={false}
                className="h-24 w-24"
              />
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-900 mt-1.5 text-center">
              Official Scan Code
            </span>
            <span className="text-[8px] text-slate-500 text-center leading-tight">
              Scan to verify employee authentication
            </span>
          </div>
        </section>

        {/* 3. Section: Biodata & Personal Details */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 bg-emerald-900 text-white px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider">
            <User className="h-3.5 w-3.5" />
            <span>1. Personal Bio-Data</span>
          </div>
          <table className="w-full text-xs mt-1.5 border border-slate-200 border-collapse">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="w-1/4 p-1.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Full Name:</td>
                <td className="w-1/4 p-1.5 font-bold text-slate-900 border-r border-slate-200">{fullName}</td>
                <td className="w-1/4 p-1.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Gender / Sex:</td>
                <td className="w-1/4 p-1.5 text-slate-900">{data.gender || "—"}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-1.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Date of Birth:</td>
                <td className="p-1.5 text-slate-900 border-r border-slate-200">{formatDateDisplay(data.dateOfBirth)}</td>
                <td className="p-1.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Marital Status:</td>
                <td className="p-1.5 text-slate-900">{data.maritalStatus || "—"}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-1.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Phone Number:</td>
                <td className="p-1.5 text-slate-900 border-r border-slate-200">{data.phoneNumber || "—"}</td>
                <td className="p-1.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Email Address:</td>
                <td className="p-1.5 text-slate-900 break-all">{data.email || "—"}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-1.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">State of Origin / LGA:</td>
                <td className="p-1.5 text-slate-900 border-r border-slate-200">
                  {data.stateOfOrigin ? `${data.stateOfOrigin} / ${data.lga || "—"}` : "—"}
                </td>
                <td className="p-1.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">State of Residence:</td>
                <td className="p-1.5 text-slate-900">{data.stateOfResidence || "—"}</td>
              </tr>
              <tr>
                <td className="p-1.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Residential Address:</td>
                <td colSpan={3} className="p-1.5 text-slate-900">{data.residentialAddress || "—"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 4. Section: Employment & Grade Information */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 bg-emerald-900 text-white px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider">
            <Building2 className="h-3.5 w-3.5" />
            <span>2. Employment & Cadre Details</span>
          </div>
          <table className="w-full text-xs mt-1.5 border border-slate-200 border-collapse">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="w-1/4 p-1.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">MDA / Ministry:</td>
                <td className="w-1/4 p-1.5 font-bold text-slate-900 border-r border-slate-200">{data.department || data.organization || "—"}</td>
                <td className="w-1/4 p-1.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Cadre / Designation:</td>
                <td className="w-1/4 p-1.5 text-slate-900">{data.cadre || data.position || "—"}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-1.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Grade Level / Step:</td>
                <td className="p-1.5 font-semibold text-slate-900 border-r border-slate-200">
                  {data.gradeLevel ? `GL ${data.gradeLevel}` : "—"} {data.step ? `/ Step ${data.step}` : ""}
                </td>
                <td className="p-1.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Salary Structure:</td>
                <td className="p-1.5 font-bold text-emerald-900">{data.salaryStructure || "—"}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-1.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">First Appointment Date:</td>
                <td className="p-1.5 text-slate-900 border-r border-slate-200">{formatDateDisplay(data.dateOfFirstAppointment)}</td>
                <td className="p-1.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Employment Type:</td>
                <td className="p-1.5 text-slate-900">{data.employmentType || "Permanent / Pensionable"}</td>
              </tr>
              <tr>
                <td className="p-1.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Work Location / Station:</td>
                <td className="p-1.5 text-slate-900 border-r border-slate-200">{data.workLocation || "—"}</td>
                <td className="p-1.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Service / File No.:</td>
                <td className="p-1.5 text-slate-900">
                  {data.serviceNumber || data.fileNumber || data.employmentId || "—"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 5. Section: Payroll, Pension & Next of Kin (2 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
          {/* Payroll & PFA */}
          <div>
            <div className="flex items-center gap-1.5 bg-emerald-900 text-white px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider">
              <CreditCard className="h-3.5 w-3.5" />
              <span>3. Payroll & Pension (RSA)</span>
            </div>
            <table className="w-full text-xs mt-1.5 border border-slate-200 border-collapse">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="p-1.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200 w-1/3">Bank Name:</td>
                  <td className="p-1.5 text-slate-900">{data.bankName || "—"}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-1.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Account No:</td>
                  <td className="p-1.5 font-mono font-bold text-slate-900">{data.accountNumber || "—"}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-1.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">PFA Name:</td>
                  <td className="p-1.5 text-slate-900">{data.pfaName || "—"}</td>
                </tr>
                <tr>
                  <td className="p-1.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">RSA PIN:</td>
                  <td className="p-1.5 font-mono text-slate-900">{data.rsaPin || "—"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Next of Kin */}
          <div>
            <div className="flex items-center gap-1.5 bg-emerald-900 text-white px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider">
              <Users2 className="h-3.5 w-3.5" />
              <span>4. Next of Kin Information</span>
            </div>
            <table className="w-full text-xs mt-1.5 border border-slate-200 border-collapse">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="p-1.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200 w-1/3">Full Name:</td>
                  <td className="p-1.5 font-semibold text-slate-900">{data.nextOfKinName || "—"}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-1.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Relationship:</td>
                  <td className="p-1.5 text-slate-900">{data.nextOfKinRelationship || "—"}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-1.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Phone No:</td>
                  <td className="p-1.5 text-slate-900">{data.nextOfKinPhoneNumber || "—"}</td>
                </tr>
                <tr>
                  <td className="p-1.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Address:</td>
                  <td className="p-1.5 text-slate-900">{data.nextOfKinAddress || "—"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. Attestation Statement */}
        <div className="rounded border border-amber-300 bg-amber-50/70 p-2.5 text-[10px] text-slate-800 leading-relaxed mb-5">
          <p className="font-bold text-amber-950 uppercase tracking-wide mb-0.5">
            Solemn Declaration & Enrolment Attestation:
          </p>
          I hereby certify that the information provided on this registration slip is true, complete, and verifiable.
          I understand that any false declaration or forged document constitutes gross misconduct under the Public
          Service Rules and attracts immediate disqualification, cancellation of enrolment, and legal prosecution
          under the laws of the Federal Republic of Nigeria.
        </div>

        {/* 7. MANDATORY SIGNATURES SECTION (i. Employee, ii. Deputy Director, iii. Director) */}
        <section className="border-2 border-slate-800 rounded-lg p-3 bg-slate-50/40 print:bg-transparent">
          <div className="text-center mb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-950">
              Signatures & Official Endorsements
            </h3>
            <p className="text-[10px] text-slate-600">
              This slip requires the following three authorized endorsements to be valid for final IPPIS payroll inclusion:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {/* i. Employee Signature */}
            <div className="flex flex-col justify-between rounded border border-slate-300 bg-white p-3 text-center shadow-xs">
              <div>
                <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-800 uppercase tracking-wider mb-2">
                  i. Employee Signature
                </span>
                <div className="h-14 flex items-center justify-center border border-dashed border-slate-200 rounded mb-2 bg-slate-50/50">
                  {data.signatureUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={data.signatureUrl}
                      alt="Employee Signature"
                      className="max-h-12 max-w-[130px] object-contain"
                    />
                  ) : (
                    <span className="text-[10px] italic text-slate-400 font-mono">
                      [ Signed Digitally ]
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="border-b-2 border-slate-800 w-full mb-1"></div>
                <p className="text-[11px] font-bold uppercase text-slate-950 truncate">
                  {fullName || "Enrollee"}
                </p>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                  Signature of Employee
                </p>
                <p className="text-[10px] text-slate-600 mt-1 font-mono">
                  Date: {formatDateDisplay(data.registrationDate) || "Duly Submitted"}
                </p>
              </div>
            </div>

            {/* ii. Deputy Director Signature */}
            <div className="flex flex-col justify-between rounded border border-emerald-300 bg-emerald-50/20 p-3 text-center shadow-xs">
              <div>
                <span className="inline-block rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-900 uppercase tracking-wider mb-2">
                  ii. Deputy Director Signature
                </span>
                <div className="h-14 flex flex-col items-center justify-center border border-dashed border-emerald-400/80 rounded mb-2 bg-emerald-50/40 p-1">
                  <span className="text-[8px] font-extrabold uppercase text-emerald-900 tracking-wider">
                    ★ VERIFIED & RECOMMENDED ★
                  </span>
                  <span className="text-[8px] text-emerald-800">
                    IPPIS Enrolment Division
                  </span>
                </div>
              </div>

              <div>
                <div className="border-b-2 border-slate-800 w-full mb-1"></div>
                <p className="text-[11px] font-bold uppercase text-slate-950">
                  Deputy Director (IPPIS)
                </p>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                  Enrolment & Payroll Operations
                </p>
                <p className="text-[10px] text-slate-600 mt-1 font-mono">
                  Date: {formatDateDisplay(data.registrationDate) || "_______________"}
                </p>
              </div>
            </div>

            {/* iii. Directors Signature */}
            <div className="flex flex-col justify-between rounded border border-emerald-600 bg-emerald-100/20 p-3 text-center shadow-xs">
              <div>
                <span className="inline-block rounded bg-emerald-800 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-2">
                  iii. Director's Signature
                </span>
                <div className="h-14 flex flex-col items-center justify-center border-2 border-emerald-800/80 rounded mb-2 bg-emerald-100/50 p-1">
                  <span className="text-[8px] font-black uppercase text-emerald-950 tracking-wider">
                    ★ EXECUTIVE SEAL & APPROVAL ★
                  </span>
                  <span className="text-[8px] font-medium text-emerald-900">
                    OAGF • Federal Republic of Nigeria
                  </span>
                </div>
              </div>

              <div>
                <div className="border-b-2 border-slate-800 w-full mb-1"></div>
                <p className="text-[11px] font-bold uppercase text-slate-950">
                  Director, IPPIS
                </p>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                  Office of the Accountant-General
                </p>
                <p className="text-[10px] text-slate-600 mt-1 font-mono">
                  Date: {formatDateDisplay(data.registrationDate) || "_______________"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Security Footer */}
        <footer className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[9px] text-slate-500">
          <div>
            <span className="font-bold text-slate-700">SECURITY NOTICE:</span> Official Government Document.
            Any unauthorized alteration or forgery is punishable under the Penal Code.
          </div>
          <div className="font-mono text-slate-600">
            IPPIS Verification Code: {data.registrationId} • Scan QR to Verify
          </div>
        </footer>

        {/* Bottom Action Footer (Hidden in Print) */}
        {showActions && (
          <div className="no-print mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              Need a physical or digital copy? You can print or download this registration slip.
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={handlePrint}
                className="bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm gap-2"
                size="sm"
              >
                <Printer className="h-4 w-4" />
                Print Registration Slip
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                className="border-emerald-700 text-emerald-800 hover:bg-emerald-50 shadow-sm gap-2"
                size="sm"
              >
                <Download className="h-4 w-4" />
                Download Slip
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Print-specific CSS */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          #ippis-registration-slip,
          #ippis-registration-slip * {
            visibility: visible;
          }
          #ippis-registration-slip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 4mm !important;
            box-shadow: none !important;
            border: 2px solid #064e3b !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}

export function RegistrationSlipDialog({
  open,
  onOpenChange,
  data,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: RegistrationSlipData | null
}) {
  if (!data) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-slate-100">
        <DialogHeader className="no-print pb-2">
          <DialogTitle className="text-xl font-bold text-emerald-950 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            Official IPPIS Registration Slip
          </DialogTitle>
        </DialogHeader>
        <RegistrationSlip data={data} onClose={() => onOpenChange(false)} showActions={true} />
      </DialogContent>
    </Dialog>
  )
}
