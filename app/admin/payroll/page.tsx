import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BadgeDollarSign, ClipboardList, FileText } from "lucide-react"

export default function PayrollPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Payroll Management</h2>
        <p className="text-muted-foreground">
          Manage employee salaries, deductions, bonuses, and generate payslips and tax reports.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">New Payment</CardTitle>
            <BadgeDollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Process new salary payments, bonuses, or other compensation for employees.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/payroll/new-payment" className="w-full">
              <Button className="w-full">Go to New Payment</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Payment History</CardTitle>
            <ClipboardList className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View and manage all payment records, track payment status, and generate reports.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/payroll/payment-history" className="w-full">
              <Button className="w-full" variant="outline">
                Go to Payment History
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Payslip Management</CardTitle>
            <FileText className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Generate, view, and distribute payslips to employees with detailed earnings and deductions.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/payroll/payslip" className="w-full">
              <Button className="w-full" variant="outline">
                Go to Payslip Management
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="rounded-lg border bg-card p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Button variant="outline" className="h-auto py-4 justify-start">
            <div className="flex flex-col items-start">
              <span>Run Payroll</span>
              <span className="text-xs text-muted-foreground">Process payments for all employees</span>
            </div>
          </Button>
          <Button variant="outline" className="h-auto py-4 justify-start">
            <div className="flex flex-col items-start">
              <span>Tax Reports</span>
              <span className="text-xs text-muted-foreground">Generate tax reports and filings</span>
            </div>
          </Button>
          <Button variant="outline" className="h-auto py-4 justify-start">
            <div className="flex flex-col items-start">
              <span>Salary Structure</span>
              <span className="text-xs text-muted-foreground">Manage salary grades and structures</span>
            </div>
          </Button>
          <Button variant="outline" className="h-auto py-4 justify-start">
            <div className="flex flex-col items-start">
              <span>Payroll Settings</span>
              <span className="text-xs text-muted-foreground">Configure payroll rules and policies</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  )
}
