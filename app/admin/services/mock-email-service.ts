/**
 * Mock Email Service
 * This service simulates sending emails without requiring initialization
 */

export class MockEmailService {
  // Static method to send an email
  static async sendEmail(to: string, subject: string, templateName: string, data: any): Promise<boolean> {
    console.log(`[MockEmailService] Sending email to: ${to}`)
    console.log(`[MockEmailService] Subject: ${subject}`)
    console.log(`[MockEmailService] Template: ${templateName}`)
    console.log(`[MockEmailService] Data:`, data)

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Always return success in mock
    return true
  }

  // Generate portal link for approved employees
  static generatePortalLink(employeeId: string): string {
    return `https://ippis.gov.ng/portal/${employeeId}`
  }

  // Generate update link for rejected employees
  static generateUpdateLink(registrationId: string): string {
    return `https://ippis.gov.ng/update/${registrationId}`
  }
}

// Export as a named export and default
export const EmailService = MockEmailService
export default MockEmailService
