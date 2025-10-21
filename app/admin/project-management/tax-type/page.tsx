import { Suspense } from "react"
import TaxTypeContent from "./tax-type-content"
import Loading from "./loading"

export const metadata = {
  title: "Tax Type Management | IPPIS Admin",
}

export default function TaxTypePage() {
  return (
    <Suspense fallback={<Loading />}>
      <TaxTypeContent />
    </Suspense>
  )
}
