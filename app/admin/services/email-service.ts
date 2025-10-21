import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export class EmailService {
  // Send an email using the configured email service
  static async sendEmail(to: string, subject: string, templateName: string, data: any): Promise<boolean> {
    try {
      // Log the email sending attempt
      await sql`
        INSERT INTO email_logs (recipient, subject, template, data, status)
        VALUES (${to}, ${subject}, ${templateName}, ${JSON.stringify(data)}, 'pending')
      `

      // In production, this would connect to a real email service
      // For now, we'll just log it and return success
      console.log(`[EmailService] Sending email to: ${to}`)
      console.log(`[EmailService] Subject: ${subject}`)
      console.log(`[EmailService] Template: ${templateName}`)

      // Update the email status to sent
      await sql`
        UPDATE email_logs 
        SET status = 'sent', sent_at = NOW() 
        WHERE recipient = ${to} AND subject = ${subject} 
        ORDER BY created_at DESC 
        LIMIT 1
      `

      return true
    } catch (error) {
      console.error("[EmailService] Error sending email:", error)
      return false
    }
  }

  // Generate portal link for approved employees
  static generatePortalLink(employeeId: string): string {
    return `${process.env.NEXT_PUBLIC_BASE_URL}/portal/${employeeId}`
  }

  // Generate update link for rejected employees
  static generateUpdateLink(registrationId: string): string {
    return `${process.env.NEXT_PUBLIC_BASE_URL}/update/${registrationId}`
  }
}

export default EmailService
