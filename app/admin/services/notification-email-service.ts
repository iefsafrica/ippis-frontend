// This is a completely new email notification service implementation
import nodemailer from "nodemailer"

interface EmailOptions {
  to: string
  subject: string
  body: string
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

// Simple class that implements the required interface
class NotificationEmailService {
  private _initialized = false
  private transporter: nodemailer.Transporter | null = null

  // Public initialize method that must be called before using the service
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

      console.log("Email notification service initialized")
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
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: options.to,
        subject: options.subject,
        html: options.body,
        attachments: options.attachments,
      }

      const info = await this.transporter.sendMail(mailOptions)

      console.log(`Sending email to ${options.to}`)
      console.log(`Subject: ${options.subject}`)

      return {
        success: true,
        messageId: `msg_${Date.now()}`,
      }
    } catch (error) {
      console.error("Failed to send email:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  // Send approval notification
  async sendApprovalNotification(
    email: string,
    name: string,
    type: string,
    comments: string,
    link: string,
  ): Promise<EmailResult> {
    return this.sendEmail({
      to: email,
      subject: `Your ${type} has been approved`,
      body: `Dear ${name}, your ${type} has been approved. Comments: ${comments}. Update link: ${link}`,
    })
  }

  // Send rejection notification
  async sendRejectionNotification(
    email: string,
    name: string,
    type: string,
    comments: string,
    link: string,
  ): Promise<EmailResult> {
    return this.sendEmail({
      to: email,
      subject: `Action Required: Your ${type} needs attention`,
      body: `Dear ${name}, your ${type} requires changes. Comments: ${comments}. Update link: ${link}`,
    })
  }

  // Send document expiration reminder
  async sendDocumentExpirationReminder(
    email: string,
    name: string,
    document: string,
    date: Date,
    link: string,
  ): Promise<EmailResult> {
    return this.sendEmail({
      to: email,
      subject: `Reminder: Your ${document} is expiring soon`,
      body: `Dear ${name}, your ${document} will expire on ${date.toLocaleDateString()}. Update link: ${link}`,
    })
  }
}

// Create a new instance
const notificationEmailService = new NotificationEmailService()

// Export both the class and the instance
export { NotificationEmailService, notificationEmailService }

// Export the instance as EmailService for backward compatibility
export const EmailService = notificationEmailService
