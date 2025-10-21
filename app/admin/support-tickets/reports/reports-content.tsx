"use client"

import type React from "react"

import { useState } from "react"
import { ReportCard } from "../components/report-card"
import { ExportButtons } from "../components/export-buttons"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, DonutChart } from "@tremor/react"
import { Clock, BarChart2, Activity, ThumbsUp } from "lucide-react"

// Mock data for reports
const ticketVolumeData = [
  { date: "Jan", "New Tickets": 45, "Resolved Tickets": 41 },
  { date: "Feb", "New Tickets": 52, "Resolved Tickets": 49 },
  { date: "Mar", "New Tickets": 48, "Resolved Tickets": 45 },
  { date: "Apr", "New Tickets": 61, "Resolved Tickets": 57 },
  { date: "May", "New Tickets": 55, "Resolved Tickets": 52 },
  { date: "Jun", "New Tickets": 67, "Resolved Tickets": 63 },
]

const responseTimeData = [
  { date: "Jan", "First Response": 3.2, "Resolution Time": 8.5 },
  { date: "Feb", "First Response": 2.8, "Resolution Time": 7.9 },
  { date: "Mar", "First Response": 3.1, "Resolution Time": 8.2 },
  { date: "Apr", "First Response": 2.5, "Resolution Time": 7.1 },
  { date: "May", "First Response": 2.3, "Resolution Time": 6.8 },
  { date: "Jun", "First Response": 2.1, "Resolution Time": 6.5 },
]

const statusDistributionData = [
  { name: "Open", value: 25 },
  { name: "In Progress", value: 35 },
  { name: "On Hold", value: 15 },
  { name: "Closed", value: 25 },
]

const categoryDistributionData = [
  { name: "IT Support", value: 40 },
  { name: "HR", value: 25 },
  { name: "Finance", value: 15 },
  { name: "Facilities", value: 10 },
  { name: "Other", value: 10 },
]

const agentPerformanceData = [
  { name: "Sarah Johnson", tickets: 45, avgResponse: 2.1, satisfaction: 4.8 },
  { name: "Michael Brown", tickets: 38, avgResponse: 2.4, satisfaction: 4.6 },
  { name: "David Clark", tickets: 42, avgResponse: 2.2, satisfaction: 4.7 },
  { name: "Jennifer Lee", tickets: 36, avgResponse: 2.5, satisfaction: 4.5 },
  { name: "Robert Wilson", tickets: 40, avgResponse: 2.3, satisfaction: 4.6 },
]

export default function ReportsContent() {
  const [dateRange, setDateRange] = useState("last30")
  const [department, setDepartment] = useState("all")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Support Tickets Reports</h2>
        <p className="text-muted-foreground">Analyze support ticket metrics and performance data.</p>
      </div>

      {/* Filters and actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7">Last 7 Days</SelectItem>
              <SelectItem value="last30">Last 30 Days</SelectItem>
              <SelectItem value="last90">Last 90 Days</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="it">IT Support</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="facilities">Facilities</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ExportButtons />
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportCard
          title="Total Tickets"
          value="328"
          change={12}
          description="Last 30 days"
          icon={<BarChart2 className="h-4 w-4 text-gray-500" />}
        />
        <ReportCard
          title="Avg. Resolution Time"
          value="6.5 hours"
          change={-8}
          description="Last 30 days"
          icon={<Clock className="h-4 w-4 text-gray-500" />}
        />
        <ReportCard
          title="First Response Time"
          value="2.1 hours"
          change={-5}
          description="Last 30 days"
          icon={<Activity className="h-4 w-4 text-gray-500" />}
        />
        <ReportCard
          title="Satisfaction Rate"
          value="92%"
          change={3}
          description="Last 30 days"
          icon={<ThumbsUp className="h-4 w-4 text-gray-500" />}
        />
      </div>

      {/* Report tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
        </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Volume</CardTitle>
                <CardDescription>New vs. Resolved tickets over time</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={ticketVolumeData}
                  index="date"
                  categories={["New Tickets", "Resolved Tickets"]}
                  colors={["blue", "green"]}
                  yAxisWidth={40}
                  showLegend={true}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
                <CardDescription>Current ticket status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <DonutChart
                  data={statusDistributionData}
                  category="value"
                  index="name"
                  colors={["green", "blue", "amber", "gray"]}
                  showLabel={true}
                  showAnimation={true}
                  showTooltip={true}
                  valueFormatter={(value) => `${value}%`}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Response & Resolution Time Trends</CardTitle>
              <CardDescription>Average time metrics over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart
                data={responseTimeData}
                index="date"
                categories={["First Response", "Resolution Time"]}
                colors={["indigo", "cyan"]}
                yAxisWidth={40}
                showLegend={true}
                valueFormatter={(value) => `${value} hours`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance tab */}
        <TabsContent value="performance" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Response Time vs. SLA</CardTitle>
              <CardDescription>Performance against service level agreements</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                data={[
                  { category: "Critical", Actual: 1.2, "SLA Target": 1.0 },
                  { category: "High", Actual: 2.1, "SLA Target": 2.0 },
                  { category: "Medium", Actual: 4.5, "SLA Target": 4.0 },
                  { category: "Low", Actual: 7.8, "SLA Target": 8.0 },
                ]}
                index="category"
                categories={["Actual", "SLA Target"]}
                colors={["blue", "gray"]}
                yAxisWidth={40}
                showLegend={true}
                valueFormatter={(value) => `${value} hours`}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Satisfaction Ratings</CardTitle>
                <CardDescription>Customer satisfaction by category</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={[
                    { category: "IT Support", Rating: 4.7 },
                    { category: "HR", Rating: 4.5 },
                    { category: "Finance", Rating: 4.3 },
                    { category: "Facilities", Rating: 4.6 },
                  ]}
                  index="category"
                  categories={["Rating"]}
                  colors={["amber"]}
                  yAxisWidth={40}
                  showLegend={false}
                  valueFormatter={(value) => `${value}/5`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resolution Rate</CardTitle>
                <CardDescription>Percentage of tickets resolved within SLA</CardDescription>
              </CardHeader>
              <CardContent>
                <DonutChart
                  data={[
                    { name: "Within SLA", value: 85 },
                    { name: "Outside SLA", value: 15 },
                  ]}
                  category="value"
                  index="name"
                  colors={["green", "red"]}
                  showLabel={true}
                  showAnimation={true}
                  valueFormatter={(value) => `${value}%`}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Categories tab */}
        <TabsContent value="categories" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Distribution by Category</CardTitle>
                <CardDescription>Breakdown of tickets by department</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={categoryDistributionData}
                  categories={["value"]}
                  index="name"
                  colors={["blue", "cyan", "indigo", "violet", "purple"]}
                  showLegend={false}
                  valueFormatter={(value) => `${value}%`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resolution Time by Category</CardTitle>
                <CardDescription>Average time to resolve by department</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={[
                    { category: "IT Support", Hours: 5.2 },
                    { category: "HR", Hours: 8.7 },
                    { category: "Finance", Hours: 6.4 },
                    { category: "Facilities", Hours: 9.1 },
                  ]}
                  index="category"
                  categories={["Hours"]}
                  colors={["indigo"]}
                  yAxisWidth={40}
                  showLegend={false}
                  valueFormatter={(value) => `${value} hours`}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Issues by Category</CardTitle>
              <CardDescription>Most common issues reported</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Category</TableHeader>
                    <TableHeader>Issue</TableHeader>
                    <TableHeader>Count</TableHeader>
                    <TableHeader>Avg. Resolution</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>IT Support</TableCell>
                    <TableCell>Password Reset</TableCell>
                    <TableCell>42</TableCell>
                    <TableCell>1.2 hours</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>IT Support</TableCell>
                    <TableCell>VPN Access</TableCell>
                    <TableCell>38</TableCell>
                    <TableCell>3.5 hours</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>HR</TableCell>
                    <TableCell>Benefits Inquiry</TableCell>
                    <TableCell>35</TableCell>
                    <TableCell>5.8 hours</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Finance</TableCell>
                    <TableCell>Expense Report</TableCell>
                    <TableCell>29</TableCell>
                    <TableCell>4.2 hours</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Facilities</TableCell>
                    <TableCell>Office Equipment</TableCell>
                    <TableCell>24</TableCell>
                    <TableCell>7.6 hours</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agents tab */}
        <TabsContent value="agents" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
              <CardDescription>Key metrics by support agent</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Agent</TableHeader>
                    <TableHeader>Tickets Handled</TableHeader>
                    <TableHeader>Avg. Response Time</TableHeader>
                    <TableHeader>Avg. Resolution Time</TableHeader>
                    <TableHeader>Satisfaction</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {agentPerformanceData.map((agent) => (
                    <TableRow key={agent.name}>
                      <TableCell>{agent.name}</TableCell>
                      <TableCell>{agent.tickets}</TableCell>
                      <TableCell>{agent.avgResponse} hours</TableCell>
                      <TableCell>{agent.avgResponse * 3} hours</TableCell>
                      <TableCell>{agent.satisfaction}/5</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tickets Resolved by Agent</CardTitle>
                <CardDescription>Number of tickets resolved per agent</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={agentPerformanceData.map((a) => ({ name: a.name, Tickets: a.tickets }))}
                  index="name"
                  categories={["Tickets"]}
                  colors={["blue"]}
                  yAxisWidth={40}
                  showLegend={false}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Time by Agent</CardTitle>
                <CardDescription>Average first response time</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={agentPerformanceData.map((a) => ({ name: a.name, Hours: a.avgResponse }))}
                  index="name"
                  categories={["Hours"]}
                  colors={["indigo"]}
                  yAxisWidth={40}
                  showLegend={false}
                  valueFormatter={(value) => `${value} hours`}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Table components for the reports page
const Table = ({ children }: { children: React.ReactNode }) => (
  <div className="relative w-full overflow-auto">
    <table className="w-full caption-bottom text-sm">{children}</table>
  </div>
)

const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">{children}</th>
)

const TableHead = ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>

const TableBody = ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>

const TableRow = ({ children }: { children: React.ReactNode }) => (
  <tr className="border-b transition-colors hover:bg-gray-50">{children}</tr>
)

const TableCell = ({ children }: { children: React.ReactNode }) => <td className="p-4 align-middle">{children}</td>
