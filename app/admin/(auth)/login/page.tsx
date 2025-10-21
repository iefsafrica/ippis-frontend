import type { Metadata } from "next"
import LoginPageClient from "../../login/login-page-client"

export const metadata: Metadata = {
  title: "Admin Login | IPPIS",
  description: "Login to the IPPIS Admin Portal",
}

export default function LoginPage() {
  return <LoginPageClient />
}
