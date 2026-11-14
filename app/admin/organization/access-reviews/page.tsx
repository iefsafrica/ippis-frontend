import { Metadata } from "next"
import { AccessReviewsContent } from "./access-reviews-content"

export const metadata: Metadata = {
  title: "Access Reviews | IPPIS Admin",
  description: "Audit and review roles and permissions per MDA.",
}

export default function AccessReviewsPage() {
  return <AccessReviewsContent />
}
