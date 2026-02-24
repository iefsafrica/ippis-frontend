import type { Metadata } from "next"
import ClientWrapper from "./client-wrapper"

export const metadata: Metadata = {
  title: "Performance Appraisal | IPPIS Admin",
  description: "Manage employee performance appraisals in the IPPIS system",
}

export default function AppraisalPage() {
  return <ClientWrapper />
}
