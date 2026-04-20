import type { Metadata } from "next"
import { AssetsContent } from "./assets-content"

export const metadata: Metadata = {
  title: "Assets Management | IPPIS Admin",
  description: "Manage organizational assets with live CRUD actions",
}

export default function AssetsPage() {
  return <AssetsContent />
}
