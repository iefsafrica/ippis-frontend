import type { Metadata } from "next"
import ClientWrapper from "./client-wrapper"

export const metadata: Metadata = {
  title: "Performance Indicators | IPPIS Admin",
  description: "Manage key performance indicators in the IPPIS system",
}

export default function IndicatorPage() {
  return <ClientWrapper />
}
