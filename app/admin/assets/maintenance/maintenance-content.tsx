"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, ClipboardList, Settings, PenToolIcon as Tool } from "lucide-react"

export function MaintenanceContent() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin/assets/list")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Asset Maintenance</h1>
        </div>
      </div>

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="dashboard">
            <Settings className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="log">
            <ClipboardList className="mr-2 h-4 w-4" />
            Maintenance Log
          </TabsTrigger>
          <TabsTrigger value="types">
            <Tool className="mr-2 h-4 w-4" />
            Maintenance Types
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Scheduled Maintenance</CardTitle>
                <CardDescription>Upcoming maintenance tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#008751]">12</div>
                <p className="text-sm text-gray-500">3 due this week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Completed Maintenance</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#008751]">28</div>
                <p className="text-sm text-gray-500">↑ 15% from previous period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Overdue Maintenance</CardTitle>
                <CardDescription>Requires immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">5</div>
                <p className="text-sm text-gray-500">2 critical assets affected</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Maintenance</CardTitle>
                <CardDescription>Next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-start border-b pb-3">
                    <div>
                      <h4 className="font-medium">Toyota Hilux - Oil Change</h4>
                      <p className="text-sm text-gray-500">Due: May 15, 2025</p>
                    </div>
                    <Button size="sm">View</Button>
                  </div>
                  <div className="flex justify-between items-start border-b pb-3">
                    <div>
                      <h4 className="font-medium">Server Room AC - Filter Replacement</h4>
                      <p className="text-sm text-gray-500">Due: May 16, 2025</p>
                    </div>
                    <Button size="sm">View</Button>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">Office Printer - Routine Maintenance</h4>
                      <p className="text-sm text-gray-500">Due: May 18, 2025</p>
                    </div>
                    <Button size="sm">View</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance by Category</CardTitle>
                <CardDescription>Distribution of maintenance tasks</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Settings className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Maintenance statistics chart will appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Schedule</CardTitle>
              <CardDescription>View and manage upcoming maintenance tasks for all assets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Maintenance Schedule</h3>
                <p>The maintenance schedule calendar will appear here</p>
                <p className="text-sm mt-2">
                  Schedule preventive maintenance, track recurring tasks, and manage maintenance assignments
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="log">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Log</CardTitle>
              <CardDescription>Historical record of all maintenance activities performed on assets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <ClipboardList className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Maintenance History</h3>
                <p>The maintenance log and history will appear here</p>
                <p className="text-sm mt-2">Track maintenance history, costs, and performance metrics for all assets</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Types</CardTitle>
              <CardDescription>Configure different types of maintenance activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Tool className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Maintenance Categories</h3>
                <p>Maintenance types and categories will appear here</p>
                <p className="text-sm mt-2">Define maintenance categories, procedures, and recommended intervals</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
