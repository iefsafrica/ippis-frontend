
import type { Metadata } from "next"
import ClientWrapper from "./client-wrapper"

export const metadata: Metadata = {
  title: "Employee Promotions | IPPIS Admin",
  description: "Manage employee promotions and career advancement",
}

export default function PromotionPage() {
  return <ClientWrapper />
}