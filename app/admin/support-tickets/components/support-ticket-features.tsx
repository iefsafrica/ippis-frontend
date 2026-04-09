import { BookOpen, BarChart2, MessageSquare, Users } from "lucide-react"
import type { ReactNode } from "react"

export interface SupportTicketFeature {
  id: string
  title: string
  description: string
  href: string
  actionLabel: string
  icon: ReactNode
  iconBg: string
  iconColor: string
}

export const SUPPORT_TICKET_FEATURES: SupportTicketFeature[] = [
  {
    id: "all-tickets",
    title: "All Tickets",
    description: "View every ticket in the system, filter by status, and respond to the most critical requests.",
    href: "/admin/support-tickets/all-tickets",
    actionLabel: "Browse tickets",
    icon: <MessageSquare className="h-5 w-5" />,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "my-tickets",
    title: "My Tickets",
    description: "Focus on tickets assigned to you or created by you so that nothing slips through the cracks.",
    href: "/admin/support-tickets/my-tickets",
    actionLabel: "Open my tickets",
    icon: <Users className="h-5 w-5" />,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    id: "knowledge-base",
    title: "Knowledge Base",
    description: "Surface helpful guides first and reduce the number of repeated questions.",
    href: "/admin/support-tickets/knowledge-base",
    actionLabel: "Explore KB",
    icon: <BookOpen className="h-5 w-5" />,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    id: "reports",
    title: "Reports",
    description: "Monitor SLA compliance, ticket volumes, and agent performance trends.",
    href: "/admin/support-tickets/reports",
    actionLabel: "View reports",
    icon: <BarChart2 className="h-5 w-5" />,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
  },
]
