import type { Metadata } from "next"
import { AssetListContent } from "./asset-list-content"

export const metadata: Metadata = {
  title: "Assets List | IPPIS Admin",
  description: "View and manage all organizational assets",
}

export default function AssetListPage() {
  return <AssetListContent />
}
