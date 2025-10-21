// This is a dummy email service that doesn't actually send emails
// It's used for development and testing purposes

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

// Simple class that implements the required interface but doesn't send real emails
class DummyEmailService {
  private _initialized = false

  // Public initialize method that must be called before using the service
  initialize() {
    if (this._initialized) return
    console.log("Dummy email service initialized - emails will be logged but not sent")
    this._initialized = true
  }

  // Send an email (just logs it)
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    if (!this._initialized) {
      this.initialize()
    }

    console.log("📧 DUMMY EMAIL SERVICE - Email would be sent with the following details:")
    console.log(`To: ${options.to}`)
    console.log(`Subject: ${options.subject}`)
    console.log(`Body: ${options.body.substring(0, 100)}...`)

    if (options.attachments && options.attachments.length > 0) {
      console.log(`Attachments: ${options.attachments.length}`)
    }

    return {
      success: true,
      messageId: `dummy_msg_${Date.now()}`,
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
    console.log(`📧 DUMMY EMAIL: Approval notification to ${name} (${email}) for ${type}`)
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
    console.log(`📧 DUMMY EMAIL: Rejection notification to ${name} (${email}) for ${type}`)
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
    console.log(`📧 DUMMY EMAIL: Document expiration reminder to ${name} (${email}) for ${document}`)
    return this.sendEmail({
      to: email,
      subject: `Reminder: Your ${document} is expiring soon`,
      body: `Dear ${name}, your ${document} will expire on ${date.toLocaleDateString()}. Update link: ${link}`,
    })
  }

  // Test the email configuration
  async testEmailConfiguration(testEmail: string): Promise<EmailResult> {
    console.log(`📧 DUMMY EMAIL: Test email configuration to ${testEmail}`)
    return this.sendEmail({
      to: testEmail,
      subject: "IPPIS Email Configuration Test",
      body: "This is a test email to verify that your IPPIS email configuration is working correctly.",
    })
  }
}

// Create a new instance
const dummyEmailService = new DummyEmailService()

// Export both the class and the instance
export { DummyEmailService, dummyEmailService }
