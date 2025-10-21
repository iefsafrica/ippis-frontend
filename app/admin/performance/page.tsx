import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Target, LineChart, Award } from "lucide-react"

export const metadata: Metadata = {
  title: "Performance Management | IPPIS Admin",
  description: "Manage employee performance in the IPPIS system",
}

export default function PerformancePage() {
  const performanceModules = [
    {
      title: "Goal Type",
      description: "Define and manage different types of performance goals",
      icon: <Target className="h-8 w-8 text-green-600" />,
      href: "/admin/performance/goal-type",
    },
    {
      title: "Goal Tracking",
      description: "Track progress of employee performance goals",
      icon: <TrendingUp className="h-8 w-8 text-blue-600" />,
      href: "/admin/performance/goal-tracking",
    },
    {
      title: "Performance Indicators",
      description: "Manage key performance indicators (KPIs)",
      icon: <LineChart className="h-8 w-8 text-purple-600" />,
      href: "/admin/performance/indicator",
    },
    {
      title: "Performance Appraisals",
      description: "Conduct and manage employee performance reviews",
      icon: <Award className="h-8 w-8 text-amber-600" />,
      href: "/admin/performance/appraisal",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Performance Management</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {performanceModules.map((module) => (
          <Link href={module.href} key={module.title}>
            <Card className="h-full transition-all hover:shadow-md hover:border-green-200">
              <CardHeader className="pb-2">
                <div className="mb-2">{module.icon}</div>
                <CardTitle>{module.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">{module.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
