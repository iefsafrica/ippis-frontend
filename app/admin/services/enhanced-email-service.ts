/**
 * Enhanced Email Service
 * Provides comprehensive email notification functionality for the IPPIS system
 */
import nodemailer from "nodemailer"
import { generateToken } from "@/lib/token-utils"

// Email template types
type EmailTemplateType =
  | "import_notification"
  | "approval_notification"
  | "rejection_notification"
  | "document_verification"
  | "missing_information"

interface EmailOptions {
  to: string
  subject: string
  templateType: EmailTemplateType
  data: Record<string, any>
  attachments?: Array<{
    filename: string
    content: string | Buffer
    contentType?: string
  }>
}

interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

export class EnhancedEmailService {
  private transporter: nodemailer.Transporter | null = null
  private _initialized = false
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://ippis.gov.ng"
  }

  // Initialize the email service
  initialize() {
    if (this._initialized) return

    try {
      this.transporter = nodemailer.createTransport({
        service: "gmail", // or your email service
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      })

      console.log("Enhanced email service initialized")
      this._initialized = true
    } catch (error) {
      console.error("Failed to initialize email service:", error)
    }
  }

  // Check if initialized and initialize if needed
  private ensureInitialized() {
    if (!this._initialized) {
      this.initialize()
    }
  }

  // Generate a secure update link with token
  generateSecureUpdateLink(registrationId: string, email: string, expiresIn = "7d"): string {
    const token = generateToken({ registrationId, email }, expiresIn)
    return `${this.baseUrl}/update/${registrationId}?token=${token}`
  }

  // Generate a portal access link
  generatePortalLink(employeeId: string): string {
    return `${this.baseUrl}/portal/${employeeId}`
  }

  // Get email template based on type and data
  private getEmailTemplate(templateType: EmailTemplateType, data: Record<string, any>): string {
    switch (templateType) {
      case "import_notification":
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e3a8a;">IPPIS Registration Information</h2>
            <p>Dear ${data.name},</p>
            <p>Your information has been imported into the Integrated Personnel and Payroll Information System (IPPIS).</p>
            ${
              data.missingFields && data.missingFields.length > 0
                ? `
              <p><strong>We need additional information to complete your registration:</strong></p>
              <ul>
                ${data.missingFields.map((field: string) => `<li>${field}</li>`).join("")}
              </ul>
              <p>Please click the button below to provide the missing information:</p>
              <p>
                <a href="${data.updateLink}" style="background-color: #16a34a; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">
                  Complete Your Registration
                </a>
              </p>
            `
                : `
              <p>Your registration is currently under review. You will be notified once it has been processed.</p>
            `
            }
            <p>If you have any questions, please contact IPPIS support.</p>
            <p>Thank you,<br>IPPIS Administration</p>
          </div>
        `

      case "approval_notification":
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">IPPIS Registration Approved</h2>
            <p>Dear ${data.name},</p>
            <p>Congratulations! Your registration with the Integrated Personnel and Payroll Information System (IPPIS) has been approved.</p>
            <p><strong>Your Employee ID:</strong> ${data.employeeId}</p>
            ${data.comments ? `<p><strong>Comments:</strong> ${data.comments}</p>` : ""}
            <p>You can now access the employee portal using the link below:</p>
            <p>
              <a href="${data.portalLink}" style="background-color: #16a34a; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Access Employee Portal
              </a>
            </p>
            <p>If you have any questions, please contact IPPIS support.</p>
            <p>Thank you,<br>IPPIS Administration</p>
          </div>
        `

      case "rejection_notification":
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">IPPIS Registration Requires Updates</h2>
            <p>Dear ${data.name},</p>
            <p>Your registration with the Integrated Personnel and Payroll Information System (IPPIS) requires some updates before it can be approved.</p>
            <p><strong>Reason:</strong> ${data.comments}</p>
            <p>Please click the button below to update your registration:</p>
            <p>
              <a href="${data.updateLink}" style="background-color: #2563eb; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Update Your Registration
              </a>
            </p>
            <p>If you have any questions, please contact IPPIS support.</p>
            <p>Thank you,<br>IPPIS Administration</p>
          </div>
        `

      case "missing_information":
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">IPPIS Registration: Missing Information</h2>
            <p>Dear ${data.name},</p>
            <p>Your registration with the Integrated Personnel and Payroll Information System (IPPIS) is incomplete. We need additional information to process your registration.</p>
            <p><strong>Missing information:</strong></p>
            <ul>
              ${data.missingFields.map((field: string) => `<li>${field}</li>`).join("")}
            </ul>
            <p>Please click the button below to provide the missing information:</p>
            <p>
              <a href="${data.updateLink}" style="background-color: #f59e0b; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Complete Your Registration
              </a>
            </p>
            <p>If you have any questions, please contact IPPIS support.</p>
            <p>Thank you,<br>IPPIS Administration</p>
          </div>
        `

      case "document_verification":
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">IPPIS Document Verification</h2>
            <p>Dear ${data.name},</p>
            <p>Your documents for the Integrated Personnel and Payroll Information System (IPPIS) have been ${data.status}.</p>
            ${data.comments ? `<p><strong>Comments:</strong> ${data.comments}</p>` : ""}
            ${
              data.status === "rejected"
                ? `
              <p>Please click the button below to upload new documents:</p>
              <p>
                <a href="${data.updateLink}" style="background-color: #2563eb; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">
                  Upload New Documents
                </a>
              </p>
            `
                : ""
            }
            <p>If you have any questions, please contact IPPIS support.</p>
            <p>Thank you,<br>IPPIS Administration</p>
          </div>
        `

      default:
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>IPPIS Notification</h2>
            <p>Dear ${data.name},</p>
            <p>${data.message || "You have a new notification from the IPPIS system."}</p>
            <p>If you have any questions, please contact IPPIS support.</p>
            <p>Thank you,<br>IPPIS Administration</p>
          </div>
        `
    }
  }

  // Send an email
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    this.ensureInitialized()

    if (!this.transporter) {
      return {
        success: false,
        error: "Email service not initialized",
      }
    }

    try {
      const htmlContent = this.getEmailTemplate(options.templateType, options.data)

      const mailOptions = {
        from: `"IPPIS Administration" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: htmlContent,
        attachments: options.attachments,
      }

      const info = await this.transporter.sendMail(mailOptions)

      console.log(`Email sent to ${options.to}: ${options.subject}`)

      return {
        success: true,
        messageId: info.messageId,
      }
    } catch (error) {
      console.error("Failed to send email:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  // Send import notification
  async sendImportNotification(
    email: string,
    name: string,
    missingFields: string[] = [],
    registrationId: string,
  ): Promise<EmailResult> {
    const updateLink = this.generateSecureUpdateLink(registrationId, email)

    return this.sendEmail({
      to: email,
      subject: "Your IPPIS Registration Information",
      templateType: "import_notification",
      data: {
        name,
        missingFields,
        updateLink,
      },
    })
  }

  // Send approval notification
  async sendApprovalNotification(
    email: string,
    name: string,
    employeeId: string,
    comments?: string,
  ): Promise<EmailResult> {
    const portalLink = this.generatePortalLink(employeeId)

    return this.sendEmail({
      to: email,
      subject: "Your IPPIS Registration Has Been Approved",
      templateType: "approval_notification",
      data: {
        name,
        employeeId,
        comments,
        portalLink,
      },
    })
  }

  // Send rejection notification
  async sendRejectionNotification(
    email: string,
    name: string,
    registrationId: string,
    comments: string,
  ): Promise<EmailResult> {
    const updateLink = this.generateSecureUpdateLink(registrationId, email)

    return this.sendEmail({
      to: email,
      subject: "Action Required: Your IPPIS Registration Needs Updates",
      templateType: "rejection_notification",
      data: {
        name,
        comments,
        updateLink,
      },
    })
  }

  // Send missing information notification
  async sendMissingInformationNotification(
    email: string,
    name: string,
    registrationId: string,
    missingFields: string[],
  ): Promise<EmailResult> {
    const updateLink = this.generateSecureUpdateLink(registrationId, email)

    return this.sendEmail({
      to: email,
      subject: "IPPIS Registration: Missing Information Required",
      templateType: "missing_information",
      data: {
        name,
        missingFields,
        updateLink,
      },
    })
  }

  // Send document verification notification
  async sendDocumentVerificationNotification(
    email: string,
    name: string,
    status: "verified" | "rejected",
    registrationId?: string,
    comments?: string,
  ): Promise<EmailResult> {
    const updateLink = registrationId ? this.generateSecureUpdateLink(registrationId, email) : ""

    return this.sendEmail({
      to: email,
      subject: `IPPIS Document ${status === "verified" ? "Verification Successful" : "Verification Failed"}`,
      templateType: "document_verification",
      data: {
        name,
        status,
        comments,
        updateLink,
      },
    })
  }
}

// Create a singleton instance
export const enhancedEmailService = new EnhancedEmailService()
