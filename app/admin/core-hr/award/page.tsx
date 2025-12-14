import type { Metadata } from "next"
import { AwardContent } from "./award-content"

export const metadata: Metadata = {
  title: "Employee Awards | IPPIS Admin",
}

export default function AwardPage() {
  return <AwardContent />
}