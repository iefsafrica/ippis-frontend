"use client"

import { useState } from "react"
import { ReportCard } from "../components/report-card"
import { ExportButtons } from "../components/export-buttons"
import { SupportTicketsShell } from "../components/support-tickets-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, DonutChart } from "@tremor/react"
import { Clock, BarChart2, Activity, ThumbsUp } from "lucide-react"

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

  const stats = [
    { label: "Total Tickets", value: "328", subtitle: "Last 30 days" },
    { label: "Avg. Resolution", value: "6.5 hours", subtitle: "Last 30 days" },
    { label: "First Response", value: "2.1 hours", subtitle: "Last 30 days" },
  ]

  return (
    <SupportTicketsShell
      title="Support Ticket Reports"
      description="Monitor SLA compliance, ticket volumes, and agent performance trends."
      stats={stats}
      actions={<ExportButtons />}
    >
      <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">Reports overview</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Charts and analytics distilled from every support interaction.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
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
          </div>

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

          <Tabs defaultValue="overview">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="agents">Agents</TabsTrigger>
            </TabsList>

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

            <TabsContent value="performance" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Response Time by Agent</CardTitle>
                    <CardDescription>Average first response for each agent</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {agentPerformanceData.map((agent) => (
                        <div key={agent.name} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{agent.name}</p>
                            <p className="text-xs text-gray-500">{agent.tickets} tickets</p>
                          </div>
                          <p className="text-sm text-gray-900">{agent.avgResponse} hrs</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Agent Satisfaction</CardTitle>
                    <CardDescription>Satisfaction scores across agents</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {agentPerformanceData.map((agent) => (
                        <div key={`${agent.name}-satisfaction`} className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900">{agent.name}</p>
                          <p className="text-sm text-green-600">{agent.satisfaction} / 5</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                  <CardDescription>Which departments raise the most tickets</CardDescription>
                </CardHeader>
                <CardContent>
                  <DonutChart
                    data={categoryDistributionData}
                    category="value"
                    index="name"
                    colors={["blue", "rose", "amber", "cyan", "emerald"]}
                    showLabel={true}
                    valueFormatter={(value) => `${value}%`}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="agents" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Agent Performance</CardTitle>
                  <CardDescription>Tickets closed vs. response times</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {agentPerformanceData.map((agent) => (
                      <div key={`performance-${agent.name}`} className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">{agent.name}</p>
                        <p className="text-sm text-gray-500">{agent.tickets} tickets · {agent.avgResponse} hrs</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </SupportTicketsShell>
  )
}
