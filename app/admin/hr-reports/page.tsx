import type React from "react"
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

interface ReportCard {
  title: string
  description: string
  href: string
  icon: React.ReactNode
}

export default function HRReportsPage() {
  const reportCards: ReportCard[] = [
    {
      title: "Attendance Report",
      description: "View employee attendance statistics and patterns",
      href: "/admin/hr-reports/attendance",
      icon: <Calendar className="h-8 w-8 text-blue-500" />,
    },
    {
      title: "Training Report",
      description: "Track employee training programs and certifications",
      href: "/admin/hr-reports/training",
      icon: <Briefcase className="h-8 w-8 text-green-500" />,
    },
    {
      title: "Project Report",
      description: "Monitor project progress, timelines and resource allocation",
      href: "/admin/hr-reports/project",
      icon: <ClipboardList className="h-8 w-8 text-purple-500" />,
    },
    {
      title: "Task Report",
      description: "Track task completion rates and employee productivity",
      href: "/admin/hr-reports/task",
      icon: <CheckSquare className="h-8 w-8 text-orange-500" />,
    },
    {
      title: "Employees Report",
      description: "Comprehensive employee data and performance metrics",
      href: "/admin/hr-reports/employees",
      icon: <Users className="h-8 w-8 text-indigo-500" />,
    },
    {
      title: "Account Report",
      description: "Financial account summaries and balances",
      href: "/admin/hr-reports/account",
      icon: <CreditCard className="h-8 w-8 text-red-500" />,
    },
    {
      title: "Expense Report",
      description: "Track departmental and organizational expenses",
      href: "/admin/hr-reports/expense",
      icon: <DollarSign className="h-8 w-8 text-yellow-500" />,
    },
    {
      title: "Deposit Report",
      description: "Monitor financial deposits and transactions",
      href: "/admin/hr-reports/deposit",
      icon: <PiggyBank className="h-8 w-8 text-teal-500" />,
    },
    {
      title: "Transaction Report",
      description: "View financial transaction history and patterns",
      href: "/admin/hr-reports/transaction",
      icon: <RefreshCw className="h-8 w-8 text-pink-500" />,
    },
    {
      title: "Pension Report",
      description: "Track employee pension contributions and benefits",
      href: "/admin/hr-reports/pension",
      icon: <Heart className="h-8 w-8 text-cyan-500" />,
    },
  ]

  return (
    <div>
      <h3 className="text-lg font-medium mb-6">Select a report type to view detailed information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">{card.icon}</div>
              <div>
                <h4 className="text-lg font-semibold mb-1">{card.title}</h4>
                <p className="text-gray-600 text-sm">{card.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
