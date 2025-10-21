// This service handles sending email notifications to employees
import nodemailer from "nodemailer"

interface EmailNotificationOptions {
  to: string
  subject: string
  body: string
  attachments?: Array<{
    filename: string
    content: string | Buffer
    contentType?: string
  }>
}

interface EmailNotificationResult {
  success: boolean
  messageId?: string
  error?: string
}

export class EmailService {
  private initialized = false
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    // Don't initialize in constructor to avoid issues during build
    // We'll initialize on-demand when needed
  }

  /**
   * Initialize the email service
   */
  public initialize(): void {
    if (this.initialized) {
      return // Already initialized
    }

    try {
      // Check if environment variables are available
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("Email credentials not found in environment variables. Email service will not work properly.")
        return
      }

      this.transporter = nodemailer.createTransport({
        service: "gmail", // You can change this to another service if needed
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      })

      console.log("Email service initialized successfully")
      this.initialized = true
    } catch (error) {
      console.error("Failed to initialize email service:", error)
    }
  }

  /**
   * Send an email notification
   */
  public async sendEmail(options: EmailNotificationOptions): Promise<EmailNotificationResult> {
    if (!this.initialized || !this.transporter) {
      this.initialize()
      if (!this.transporter) {
        return {
          success: false,
          error: "Email service not initialized. Check environment variables.",
        }
      }
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: options.to,
        subject: options.subject,
        html: options.body,
        attachments: options.attachments,
      }

      const info = await this.transporter.sendMail(mailOptions)

      console.log(`Email sent to ${options.to}:`, info.messageId)

      return {
        success: true,
        messageId: info.messageId,
      }
    } catch (error) {
      console.error("Error sending email:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  /**
   * Send an approval notification to an employee
   */
  public async sendApprovalNotification(
    employeeEmail: string,
    employeeName: string,
    approvalType: string,
    comments: string,
    updateLink: string,
  ): Promise<EmailNotificationResult> {
    const subject = `Your ${approvalType} has been approved`
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <h2 style="color: #333;">Approval Notification</h2>
        <p>Dear ${employeeName},</p>
        <p>We're pleased to inform you that your ${approvalType} has been approved.</p>
        <p><strong>Reviewer comments:</strong> ${comments}</p>
        <p>You can view the details and make updates if needed by clicking the button below:</p>
        <p style="text-align: center;">
          <a href="${updateLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">View Details</a>
        </p>
        <p>Thank you,<br>IPPIS Administration Team</p>
      </div>
    `

    return this.sendEmail({
      to: employeeEmail,
      subject,
      body,
    })
  }

  /**
   * Send a rejection notification to an employee
   */
  public async sendRejectionNotification(
    employeeEmail: string,
    employeeName: string,
    rejectionType: string,
    comments: string,
    updateLink: string,
  ): Promise<EmailNotificationResult> {
    const subject = `Action Required: Your ${rejectionType} needs attention`
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <h2 style="color: #d32f2f;">Action Required</h2>
        <p>Dear ${employeeName},</p>
        <p>Your ${rejectionType} requires some changes before it can be approved.</p>
        <p><strong>Reviewer comments:</strong> ${comments}</p>
        <p>Please make the necessary updates by clicking the button below:</p>
        <p style="text-align: center;">
          <a href="${updateLink}" style="display: inline-block; padding: 10px 20px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 4px;">Make Updates</a>
        </p>
        <p>If you have any questions, please contact the IPPIS support team.</p>
        <p>Thank you,<br>IPPIS Administration Team</p>
      </div>
    `

    return this.sendEmail({
      to: employeeEmail,
      subject,
      body,
    })
  }

  /**
   * Send a document expiration reminder
   */
  public async sendDocumentExpirationReminder(
    employeeEmail: string,
    employeeName: string,
    documentName: string,
    expirationDate: Date,
    updateLink: string,
  ): Promise<EmailNotificationResult> {
    const subject = `Reminder: Your ${documentName} is expiring soon`
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <h2 style="color: #ff9800;">Document Expiration Reminder</h2>
        <p>Dear ${employeeName},</p>
        <p>This is a reminder that your <strong>${documentName}</strong> will expire on <strong>${expirationDate.toLocaleDateString()}</strong>.</p>
        <p>Please update your document by clicking the button below:</p>
        <p style="text-align: center;">
          <a href="${updateLink}" style="display: inline-block; padding: 10px 20px; background-color: #ff9800; color: white; text-decoration: none; border-radius: 4px;">Update Document</a>
        </p>
        <p>Thank you,<br>IPPIS Administration Team</p>
      </div>
    `

    return this.sendEmail({
      to: employeeEmail,
      subject,
      body,
    })
  }

  /**
   * Test the email configuration
   */
  public async testEmailConfiguration(testEmail: string): Promise<EmailNotificationResult> {
    const subject = "IPPIS Email Configuration Test"
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <h2 style="color: #2196F3;">Email Configuration Test</h2>
        <p>This is a test email to verify that your IPPIS email configuration is working correctly.</p>
        <p>If you received this email, your email service is properly configured.</p>
        <p>Thank you,<br>IPPIS System</p>
      </div>
    `

    return this.sendEmail({
      to: testEmail,
      subject,
      body,
    })
  }
}

// Export a new instance of the service
export const emailService = new EmailService()
