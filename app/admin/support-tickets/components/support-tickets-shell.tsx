import type { ReactNode } from "react"
import Link from "next/link"
import { BarChart3 } from "lucide-react"

export interface SupportTicketStat {
  label: string
  value: string | number
  subtitle: string
}

interface SupportTicketsShellProps {
  title: string
  description: string
  stats: SupportTicketStat[]
  actions?: ReactNode
  children: ReactNode
}

export function SupportTicketsShell({
  title,
  description,
  stats,
  actions,
  children,
}: SupportTicketsShellProps) {
  return (
    <div className="p-6 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-gray-400">Support Desk</p>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
              <Link
                href="/admin/support-tickets/analytics"
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200"
              >
                <BarChart3 className="w-3.5 h-3.5" /> Analytics Dashboard
              </Link>
            </div>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <p className="text-xs uppercase tracking-[0.4em] text-gray-400">{stat.label}</p>
              <p className="text-3xl font-semibold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
      {children}
    </div>
  )
}
