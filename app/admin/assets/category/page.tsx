import type { Metadata } from "next"
import { CategoryContent } from "./category-content"

export const metadata: Metadata = {
  title: "Asset Categories | IPPIS Admin",
  description: "Manage asset categories in the system",
}

export default function CategoryPage() {
  return <CategoryContent />
}
