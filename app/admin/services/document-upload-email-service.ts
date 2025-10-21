// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Generate a unique ID
const generateId = (prefix: string) => {
  return `${prefix}${Math.floor(10000 + Math.random() * 90000)}`
}

// Mock service for sending document upload links
export const DocumentUploadEmailService = {
  // Send document upload link to employee
  sendDocumentUploadLink: async ({
    employeeId,
    employeeName,
    email,
  }: {
    employeeId: string
    employeeName: string
    email: string
  }): Promise<{
    id: string
    to: string
    subject: string
    body: string
    sentAt: string
    status: "sent" | "failed"
  }> => {
    await delay(300) // Simulate sending delay

    // Generate a secure upload link
    const uploadLink = `https://ippis.gov.ng/document-upload/${employeeId}?token=${generateId("TKN")}`

    // Create email notification
    const emailNotification = {
      id: generateId("EMAIL"),
      to: email,
      subject: "IPPIS: Upload Your Documents",
      body: `
Dear ${employeeName},

Your employee record has been created in the IPPIS system. To complete your registration, 
please upload the following required documents using the secure link below:

${uploadLink}

Required documents:
1. Appointment Letter
2. Educational Certificates
3. Promotion Letter (if applicable)
4. Profile Image
5. Signature

This link will expire in 7 days. Please ensure you upload all required documents before the expiration date.

Thank you,
IPPIS Admin Team
      `,
      sentAt: new Date().toISOString(),
      status: "sent" as const,
    }

    return emailNotification
  },

  // Verify if document upload link is valid
  verifyUploadLink: async (token: string): Promise<boolean> => {
    await delay(200)
    // In a real implementation, this would verify the token
    return token.startsWith("TKN")
  },
}
