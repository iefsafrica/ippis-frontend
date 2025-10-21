"use client"

import { useState } from "react"
import { TicketTable } from "../components/ticket-table"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MyTicketsContent() {
  const [activeTab, setActiveTab] = useState("all")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Support Tickets</h2>
        <p className="text-muted-foreground">View and manage tickets that are assigned to you or created by you.</p>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All My Tickets</TabsTrigger>
          <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
          <TabsTrigger value="created">Created by Me</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card>
            <CardContent className="pt-6">
              <TicketTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="assigned">
          <Card>
            <CardContent className="pt-6">
              <TicketTable showAssignedToMe={true} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="created">
          <Card>
            <CardContent className="pt-6">
              <TicketTable showCreatedByMe={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
