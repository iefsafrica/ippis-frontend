import type { ComponentPropsWithoutRef } from "react"
import { SupportTicketFeatureCard } from "./support-ticket-feature-card"
import { SUPPORT_TICKET_FEATURES } from "./support-ticket-features"

interface SupportTicketsModuleNavProps extends ComponentPropsWithoutRef<"div"> {
  columns?: string
}

export function SupportTicketsModuleNav({ columns, className }: SupportTicketsModuleNavProps) {
  const columnClasses = columns ?? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

  return (
    <div className={`grid gap-4 ${columnClasses} ${className ?? ""}`.trim()}>
      {SUPPORT_TICKET_FEATURES.map((feature) => (
        <SupportTicketFeatureCard key={feature.id} feature={feature} />
      ))}
    </div>
  )
}
