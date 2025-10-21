import { Suspense } from "react"
import InvoiceContent from "./invoice-content"
import Loading from "./loading"

export const metadata = {
  title: "Invoice Management | IPPIS Admin",
}

export default function InvoicePage() {
  return (
    <Suspense fallback={<Loading />}>
      <InvoiceContent />
    </Suspense>
  )
}
