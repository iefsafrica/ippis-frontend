import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, CheckSquare, CreditCard, Percent } from "lucide-react"

export default function ProjectManagementPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Project Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Projects</CardTitle>
            <CardDescription>Manage all your organization's projects</CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-sm text-gray-500">
              Create, track, and manage projects with team assignments, milestones, and budgets.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/project-management/projects" passHref>
              <Button className="w-full">Manage Projects</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-2">
              <CheckSquare className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>Track and assign tasks to team members</CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-sm text-gray-500">
              Create tasks, set priorities, track progress, and manage deadlines for your projects.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/project-management/tasks" passHref>
              <Button className="w-full">Manage Tasks</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle>Clients</CardTitle>
            <CardDescription>Manage your client relationships</CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-sm text-gray-500">
              Store client information, track communications, and manage client projects.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/project-management/client" passHref>
              <Button className="w-full">Manage Clients</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center mb-2">
              <CreditCard className="h-6 w-6 text-amber-600" />
            </div>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>Create and manage project invoices</CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-sm text-gray-500">
              Generate invoices for clients, track payments, and manage billing for your projects.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/project-management/invoice" passHref>
              <Button className="w-full">Manage Invoices</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="w-12 h-12 rounded-lg bg-rose-100 flex items-center justify-center mb-2">
              <Percent className="h-6 w-6 text-rose-600" />
            </div>
            <CardTitle>Tax Types</CardTitle>
            <CardDescription>Configure tax rates for invoices</CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-sm text-gray-500">
              Set up different tax types and rates to apply to your invoices based on location and service type.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/project-management/tax-type" passHref>
              <Button className="w-full">Manage Tax Types</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
