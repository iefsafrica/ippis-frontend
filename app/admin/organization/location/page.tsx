import type { Metadata } from "next"
import LocationContent from "./location-content"

export const metadata: Metadata = {
  title: "Location | IPPIS Admin",
  description: "Manage organization locations",
}

export default function LocationPage() {
  return <LocationContent />
}
