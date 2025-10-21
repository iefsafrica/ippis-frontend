"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Calendar,
  Briefcase,
  ClipboardList,
  CheckSquare,
  Users,
  CreditCard,
  DollarSign,
  PiggyBank,
  RefreshCw,
  Heart,
} from "lucide-react"

interface ReportLink {
  name: string
  href: string
  icon: React.ReactNode
}

export default function ReportsNavigation() {
  const pathname = usePathname()

  const reportLinks: ReportLink[] = [
    {
      name: "Attendance",
      href: "/admin/hr-reports/attendance",
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      name: "Training",
      href: "/admin/hr-reports/training",
      icon: <Briefcase className="h-4 w-4" />,
    },
    {
      name: "Project",
      href: "/admin/hr-reports/project",
      icon: <ClipboardList className="h-4 w-4" />,
    },
    {
      name: "Task",
      href: "/admin/hr-reports/task",
      icon: <CheckSquare className="h-4 w-4" />,
    },
    {
      name: "Employees",
      href: "/admin/hr-reports/employees",
      icon: <Users className="h-4 w-4" />,
    },
    {
      name: "Account",
      href: "/admin/hr-reports/account",
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      name: "Expense",
      href: "/admin/hr-reports/expense",
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      name: "Deposit",
      href: "/admin/hr-reports/deposit",
      icon: <PiggyBank className="h-4 w-4" />,
    },
    {
      name: "Transaction",
      href: "/admin/hr-reports/transaction",
      icon: <RefreshCw className="h-4 w-4" />,
    },
    {
      name: "Pension",
      href: "/admin/hr-reports/pension",
      icon: <Heart className="h-4 w-4" />,
    },
  ]

  return (
    <div className="bg-white shadow rounded-lg mb-6 overflow-hidden">
      <div className="overflow-x-auto">
        <div className="flex min-w-max">
          {reportLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{link.icon}</span>
                {link.name}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
