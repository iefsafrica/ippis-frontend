import type { Metadata } from "next"
import ClientWrapper from "./client-wrapper"

export const metadata: Metadata = {
  title: "Goal Tracking | IPPIS Admin",
  description: "Track employee performance goals in the IPPIS system",
}

export default function GoalTrackingPage() {
  return <ClientWrapper />
}
