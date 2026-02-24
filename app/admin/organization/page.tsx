import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Building, MapPin, Briefcase, Megaphone, FileText } from "lucide-react"

export default function OrganizationPage() {
  const modules = [
    {
      title: "Company",
      href: "/admin/organization/company",
      description: "Manage company profiles and core settings",
      icon: Building,
    },
    {
      title: "Department",
      href: "/admin/organization/department",
      description: "Create and maintain departments",
      icon: Building2,
    },
    {
      title: "Location",
      href: "/admin/organization/location",
      description: "Maintain office and branch locations",
      icon: MapPin,
    },
    {
      title: "Designation",
      href: "/admin/organization/designation",
      description: "Manage staff designations and roles",
      icon: Briefcase,
    },
    {
      title: "Announcements",
      href: "/admin/organization/announcements",
      description: "Publish internal announcements",
      icon: Megaphone,
    },
    {
      title: "Company Policy",
      href: "/admin/organization/company-policy",
      description: "Maintain company policies and versions",
      icon: FileText,
    },
  ]

  return (
    <div className="space-y-6 px-2 sm:px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Organization</h1>
        <p className="text-muted-foreground">Select a module to manage organization data with dummy table records.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon
          return (
            <Link key={module.title} href={module.href}>
              <Card className="h-full transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-green-50 text-green-700 flex items-center justify-center mb-2">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-green-700">Open {module.title.toLowerCase()} table</div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
