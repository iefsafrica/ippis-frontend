import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendDocumentStatusEmail({
  to,
  status,
  comment,
}: {
  to: string
  status: "approved" | "rejected"
  comment?: string
}) {
  const subject = `Your IPPIS document status: ${status}`
  const message = `
    Hello,

    Your documents have been ${status} by the IPPIS team.

    ${comment ? `Comment: ${comment}` : ""}

    If you have any questions, please contact support.

    Regards,
    IPPIS HR Team
  `

  return transporter.sendMail({
    from: `"IPPIS HR" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text: message,
  })
}
