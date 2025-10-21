import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Award, Calendar } from "lucide-react"
import Link from "next/link"

export default function TrainingPage() {
  const trainingModules = [
    {
      title: "Training List",
      description:
        "Manage all training programs, including details about participants, schedules, and completion status",
      icon: <Calendar className="h-6 w-6" />,
      href: "/admin/training/list",
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Training Type",
      description: "Define and manage different categories of training programs offered within the organization",
      icon: <BookOpen className="h-6 w-6" />,
      href: "/admin/training/type",
      color: "bg-green-50 text-green-700",
    },
    {
      title: "Trainers",
      description: "Manage internal and external training facilitators, their expertise areas, and availability",
      icon: <Award className="h-6 w-6" />,
      href: "/admin/training/trainers",
      color: "bg-purple-50 text-purple-700",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Training Management</h1>
        <p className="text-muted-foreground">
          Manage training programs, types, and trainers to enhance employee skills and development
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trainingModules.map((module) => (
          <Link key={module.title} href={module.href}>
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div className={`w-12 h-12 rounded-full ${module.color} flex items-center justify-center mb-2`}>
                  {module.icon}
                </div>
                <CardTitle>{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-blue-600">Manage {module.title.toLowerCase()} →</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
