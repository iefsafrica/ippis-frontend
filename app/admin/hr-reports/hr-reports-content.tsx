"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { DateRange } from "react-day-picker"
import { DateRangePicker } from "../hr-calendar/date-range-picker"
import { BarChart, LineChart, PieChart } from "./report-charts"
import { Download, FileText, Printer, Share2 } from "lucide-react"

export default function HRReportsContent() {
  const [reportType, setReportType] = useState("employee")
  const [date, setDate] = useState<Date>()
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  })

  return (
    <div className="space-y-6">
      <Tabs defaultValue="standard" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <TabsList>
            <TabsTrigger value="standard">Standard Reports</TabsTrigger>
            <TabsTrigger value="custom">Custom Reports</TabsTrigger>
            <TabsTrigger value="saved">Saved Reports</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <TabsContent value="standard" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ReportCard
              title="Employee Demographics"
              description="Age, gender, and diversity distribution"
              icon={<PieChart className="h-12 w-12 text-green-600" />}
              onClick={() => setReportType("employee")}
              active={reportType === "employee"}
            />
            <ReportCard
              title="Attendance Summary"
              description="Attendance rates and patterns"
              icon={<BarChart className="h-12 w-12 text-blue-600" />}
              onClick={() => setReportType("attendance")}
              active={reportType === "attendance"}
            />
            <ReportCard
              title="Leave Analysis"
              description="Leave usage and patterns"
              icon={<LineChart className="h-12 w-12 text-purple-600" />}
              onClick={() => setReportType("leave")}
              active={reportType === "leave"}
            />
            <ReportCard
              title="Payroll Summary"
              description="Salary and compensation analysis"
              icon={<BarChart className="h-12 w-12 text-amber-600" />}
              onClick={() => setReportType("payroll")}
              active={reportType === "payroll"}
            />
            <ReportCard
              title="Performance Metrics"
              description="Employee performance indicators"
              icon={<LineChart className="h-12 w-12 text-red-600" />}
              onClick={() => setReportType("performance")}
              active={reportType === "performance"}
            />
            <ReportCard
              title="Training & Development"
              description="Training completion and skills"
              icon={<PieChart className="h-12 w-12 text-indigo-600" />}
              onClick={() => setReportType("training")}
              active={reportType === "training"}
            />
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>
                    {reportType === "employee" && "Employee Demographics Report"}
                    {reportType === "attendance" && "Attendance Summary Report"}
                    {reportType === "leave" && "Leave Analysis Report"}
                    {reportType === "payroll" && "Payroll Summary Report"}
                    {reportType === "performance" && "Performance Metrics Report"}
                    {reportType === "training" && "Training & Development Report"}
                  </CardTitle>
                  <CardDescription>
                    {reportType === "employee" && "Distribution of employees by various demographics"}
                    {reportType === "attendance" && "Attendance patterns and trends"}
                    {reportType === "leave" && "Leave usage patterns and availability"}
                    {reportType === "payroll" && "Salary distribution and compensation analysis"}
                    {reportType === "performance" && "Key performance indicators and trends"}
                    {reportType === "training" && "Training completion rates and skill development"}
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="hr">Human Resources</SelectItem>
                      <SelectItem value="it">Information Technology</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                  <DateRangePicker date={dateRange} setDate={setDateRange} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center">
                {reportType === "employee" && <EmployeeDemographicsReport />}
                {reportType === "attendance" && <AttendanceSummaryReport />}
                {reportType === "leave" && <LeaveAnalysisReport />}
                {reportType === "payroll" && <PayrollSummaryReport />}
                {reportType === "performance" && <PerformanceMetricsReport />}
                {reportType === "training" && <TrainingDevelopmentReport />}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Report Builder</CardTitle>
              <CardDescription>Create a custom report by selecting data points and filters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Report Type</h3>
                    <Select defaultValue="employee">
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="attendance">Attendance</SelectItem>
                        <SelectItem value="leave">Leave</SelectItem>
                        <SelectItem value="payroll">Payroll</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Department</h3>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="hr">Human Resources</SelectItem>
                        <SelectItem value="it">Information Technology</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Date Range</h3>
                    <DateRangePicker date={dateRange} setDate={setDateRange} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Data Fields</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="name" className="rounded border-gray-300" defaultChecked />
                        <label htmlFor="name" className="text-sm">
                          Name
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="id" className="rounded border-gray-300" defaultChecked />
                        <label htmlFor="id" className="text-sm">
                          Employee ID
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="department" className="rounded border-gray-300" defaultChecked />
                        <label htmlFor="department" className="text-sm">
                          Department
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="position" className="rounded border-gray-300" defaultChecked />
                        <label htmlFor="position" className="text-sm">
                          Position
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="salary" className="rounded border-gray-300" />
                        <label htmlFor="salary" className="text-sm">
                          Salary
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="hire-date" className="rounded border-gray-300" />
                        <label htmlFor="hire-date" className="text-sm">
                          Hire Date
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="status" className="rounded border-gray-300" />
                        <label htmlFor="status" className="text-sm">
                          Status
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="performance" className="rounded border-gray-300" />
                        <label htmlFor="performance" className="text-sm">
                          Performance
                        </label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Chart Type</h3>
                    <Select defaultValue="bar">
                      <SelectTrigger>
                        <SelectValue placeholder="Select chart type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bar">Bar Chart</SelectItem>
                        <SelectItem value="line">Line Chart</SelectItem>
                        <SelectItem value="pie">Pie Chart</SelectItem>
                        <SelectItem value="table">Table</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset</Button>
              <Button>Generate Report</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Custom Report Preview</CardTitle>
              <CardDescription>Preview of your custom report</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>Configure your custom report and click "Generate Report" to see the preview here.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <SavedReportCard
              title="Monthly Attendance 2023"
              description="Monthly attendance summary for 2023"
              date="Jan 15, 2023"
              type="Attendance"
            />
            <SavedReportCard
              title="Q1 Performance Review"
              description="Performance metrics for Q1 2023"
              date="Apr 5, 2023"
              type="Performance"
            />
            <SavedReportCard
              title="Annual Leave Report"
              description="Annual leave usage patterns"
              date="Dec 20, 2023"
              type="Leave"
            />
            <SavedReportCard
              title="Department Headcount"
              description="Employee distribution by department"
              date="Feb 28, 2023"
              type="Employee"
            />
            <SavedReportCard
              title="Salary Distribution"
              description="Salary ranges across departments"
              date="Jul 10, 2023"
              type="Payroll"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ReportCard({ title, description, icon, onClick, active }: any) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:border-green-500 ${active ? "border-green-500 bg-green-50" : ""}`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">{icon}</div>
      </CardContent>
    </Card>
  )
}

function SavedReportCard({ title, description, date, type }: any) {
  return (
    <Card className="cursor-pointer transition-all hover:border-blue-500">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{title}</CardTitle>
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">{type}</span>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-500">Last generated: {date}</p>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex gap-2 w-full">
          <Button variant="outline" size="sm" className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            View
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

function EmployeeDemographicsReport() {
  return (
    <div className="w-full h-full grid grid-cols-2 gap-6">
      <div>
        <h3 className="text-sm font-medium mb-2 text-center">Gender Distribution</h3>
        <div className="h-[300px] flex items-center justify-center">
          <PieChart className="h-full w-full" />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2 text-center">Age Distribution</h3>
        <div className="h-[300px] flex items-center justify-center">
          <BarChart className="h-full w-full" />
        </div>
      </div>
    </div>
  )
}

function AttendanceSummaryReport() {
  return (
    <div className="w-full h-full">
      <h3 className="text-sm font-medium mb-2 text-center">Monthly Attendance Rate</h3>
      <div className="h-[300px] flex items-center justify-center">
        <LineChart className="h-full w-full" />
      </div>
    </div>
  )
}

function LeaveAnalysisReport() {
  return (
    <div className="w-full h-full grid grid-cols-2 gap-6">
      <div>
        <h3 className="text-sm font-medium mb-2 text-center">Leave Type Distribution</h3>
        <div className="h-[300px] flex items-center justify-center">
          <PieChart className="h-full w-full" />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2 text-center">Monthly Leave Trends</h3>
        <div className="h-[300px] flex items-center justify-center">
          <LineChart className="h-full w-full" />
        </div>
      </div>
    </div>
  )
}

function PayrollSummaryReport() {
  return (
    <div className="w-full h-full">
      <h3 className="text-sm font-medium mb-2 text-center">Salary Distribution by Department</h3>
      <div className="h-[300px] flex items-center justify-center">
        <BarChart className="h-full w-full" />
      </div>
    </div>
  )
}

function PerformanceMetricsReport() {
  return (
    <div className="w-full h-full">
      <h3 className="text-sm font-medium mb-2 text-center">Performance Ratings by Department</h3>
      <div className="h-[300px] flex items-center justify-center">
        <BarChart className="h-full w-full" />
      </div>
    </div>
  )
}

function TrainingDevelopmentReport() {
  return (
    <div className="w-full h-full grid grid-cols-2 gap-6">
      <div>
        <h3 className="text-sm font-medium mb-2 text-center">Training Completion Rate</h3>
        <div className="h-[300px] flex items-center justify-center">
          <PieChart className="h-full w-full" />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2 text-center">Skills Distribution</h3>
        <div className="h-[300px] flex items-center justify-center">
          <BarChart className="h-full w-full" />
        </div>
      </div>
    </div>
  )
}
