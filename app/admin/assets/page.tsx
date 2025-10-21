import type { Metadata } from "next"
import { AssetsContent } from "./assets-content"

export const metadata: Metadata = {
  title: "Assets Management | IPPIS Admin",
  description: "Manage organizational assets in the system",
}

export default function AssetsPage() {
  return <AssetsContent />
}
