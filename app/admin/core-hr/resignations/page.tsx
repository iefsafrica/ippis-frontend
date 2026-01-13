// import type { Metadata } from "next"
// import { ResignationsContent } from "./resignations-content"

// export const metadata: Metadata = {
//   title: "Employee Resignations | IPPIS Admin",
// }

// export default function ResignationsPage() {
//   return <ResignationsContent />
// }


import type { Metadata } from "next"
import { ResignationsContent } from "./resignations-content"

export const metadata: Metadata = {
  title: "Employee Resignations | IPPIS Admin",
}

export default function ResignationsPage() {
  return <ResignationsContent />
}