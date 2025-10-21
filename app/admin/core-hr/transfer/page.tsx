// "use client";

import type { Metadata } from "next"
import { TransferContent } from "./transfer-content"

export const metadata: Metadata = {
  title: "Employee Transfers | IPPIS Admin",
}

export default function TransferPage() {
  return <TransferContent />
}
