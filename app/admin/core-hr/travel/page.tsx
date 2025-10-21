import type { Metadata } from "next"
import { TravelContent } from "./travel-content"

export const metadata: Metadata = {
  title: "Employee Travel | IPPIS Admin",
}

export default function TravelPage() {
  return <TravelContent />
}
