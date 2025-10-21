// Server-side email utilities
import nodemailer from "nodemailer"

// Create a transporter with environment variables
export function createEmailTransporter() {
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASS

  if (!user || !pass) {
    console.warn("Email credentials not found in environment variables")
    return null
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  })
}

// Send an email
export async function sendEmail(to: string, subject: string, html: string) {
  const transporter = createEmailTransporter()

  if (!transporter) {
    console.error("Email transporter could not be created")
    return false
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    })
    return true
  } catch (error) {
    console.error("Failed to send email:", error)
    return false
  }
}
