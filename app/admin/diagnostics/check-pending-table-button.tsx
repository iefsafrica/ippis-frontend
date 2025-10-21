"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Table } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function CheckPendingTableButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [tableInfo, setTableInfo] = useState<any>(null)
  const { toast } = useToast()

  const checkTable = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/diagnostics/pending-table")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to check pending employees table")
      }

      setTableInfo(data)
    } catch (error) {
      console.error("Error checking table:", error)

      toast({
        title: "Check Failed",
        description: error instanceof Error ? error.message : "Failed to check pending employees table",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={checkTable} disabled={isLoading} variant="outline">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Checking...
          </>
        ) : (
          <>
            <Table className="mr-2 h-4 w-4" />
            Check Pending Table Structure
          </>
        )}
      </Button>

      {tableInfo && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Table Structure</CardTitle>
              <CardDescription>Columns in the pending_employees table</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Column Name</th>
                      <th className="text-left p-2">Data Type</th>
                      <th className="text-left p-2">Nullable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableInfo.tableStructure.map((column: any, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{column.column_name}</td>
                        <td className="p-2">{column.data_type}</td>
                        <td className="p-2">{column.is_nullable === "YES" ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sample Data</CardTitle>
              <CardDescription>First 5 rows from the pending_employees table</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Surname</th>
                      <th className="text-left p-2">Firstname</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableInfo.sampleData.map((row: any, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{row.id}</td>
                        <td className="p-2">{row.name}</td>
                        <td className="p-2">{row.email}</td>
                        <td className="p-2">{row.surname || "—"}</td>
                        <td className="p-2">{row.firstname || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
