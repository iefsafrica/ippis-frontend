import { Metadata } from "next"
import { RestructureContent } from "./restructure-content"

export const metadata: Metadata = {
  title: "Organization Restructuring | IPPIS Admin",
  description: "Move departments and merge MDAs with safety checks and dry-run preview.",
}

export default function RestructurePage() {
  return <RestructureContent />
}
