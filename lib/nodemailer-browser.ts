// This is a browser-safe version of nodemailer for client components
// It provides mock implementations of nodemailer functions

export const createTransport = () => {
  return {
    sendMail: async () => {
      console.warn("Email sending is not available in browser environment")
      return { messageId: "browser-mock-id" }
    },
    verify: async () => {
      console.warn("Email verification is not available in browser environment")
      return true
    },
  }
}

export default {
  createTransport,
}
