import type { Metadata } from "next"
import ClientWrapper from "./client-wrapper"

export const metadata: Metadata = {
  title: "Goal Type | IPPIS Admin",
  description: "Manage performance goal types in the IPPIS system",
}

export default function GoalTypePage() {
  return <ClientWrapper />
}
