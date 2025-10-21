"use client"

import { CardFooter } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Database, AlertCircle, CheckCircle, RefreshCw, TableProperties } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { SeedPendingButton } from "./seed-pending-button"
import { CheckPendingTableButton } from "./check-pending-table-button"

export default function DiagnosticsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tables, setTables] = useState<string[]>([])
  const [tableStructures, setTableStructures] = useState<Record<string, any>>({})
  const [pendingCount, setPendingCount] = useState(0)
  const [setupLoading, setSetupLoading] = useState(false)
  const [seedLoading, setSeedLoading] = useState(false)
  const [setupPendingLoading, setSetupPendingLoading] = useState(false)
  const { toast } = useToast()

  const fetchDiagnostics = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/diagnostics/tables")

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setTables(data.tables || [])
        setTableStructures(data.tableStructures || {})
        setPendingCount(data.pendingEmployeesCount || 0)
      } else {
        throw new Error(data.error || "Unknown error")
      }
    } catch (err) {
      console.error("Failed to fetch diagnostics:", err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const setupTables = async () => {
    setSetupLoading(true)

    try {
      const response = await fetch("/api/admin/setup-tables", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Tables created successfully",
        })

        // Refresh the diagnostics
        await fetchDiagnostics()
      } else {
        throw new Error(data.error || "Unknown error")
      }
    } catch (err) {
      console.error("Failed to setup tables:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      })
    } finally {
      setSetupLoading(false)
    }
  }

  const setupPendingTable = async () => {
    setSetupPendingLoading(true)

    try {
      const response = await fetch("/api/admin/setup-pending-table", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Pending employees table created successfully",
        })

        // Refresh the diagnostics
        await fetchDiagnostics()
      } else {
        throw new Error(data.error || "Unknown error")
      }
    } catch (err) {
      console.error("Failed to setup pending employees table:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      })
    } finally {
      setSetupPendingLoading(false)
    }
  }

  const seedTestEmployees = async () => {
    setSeedLoading(true)

    try {
      const response = await fetch("/api/admin/seed-test-employees", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: data.message || "Test employees seeded successfully",
        })

        // Refresh the diagnostics
        await fetchDiagnostics()
      } else {
        throw new Error(data.error || "Unknown error")
      }
    } catch (err) {
      console.error("Failed to seed test employees:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      })
    } finally {
      setSeedLoading(false)
    }
  }

  useEffect(() => {
    fetchDiagnostics()
  }, [])

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Database Diagnostics</h1>
          <p className="text-muted-foreground">Check the status of your database tables and pending employees.</p>
        </div>
        <Button onClick={fetchDiagnostics} variant="outline" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Database Tables</CardTitle>
            <CardDescription>List of tables in your database</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : tables.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No tables found</AlertTitle>
                <AlertDescription>Your database does not have any tables yet.</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {tables.map((table) => (
                    <Badge key={table} variant="outline" className="text-sm">
                      {table}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-medium">Required Tables</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-6 h-6 mr-2">
                        {tables.includes("pending_employees") ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-amber-500" />
                        )}
                      </div>
                      <span>pending_employees</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 mr-2">
                        {tables.includes("registrations") ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-amber-500" />
                        )}
                      </div>
                      <span>registrations</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 mr-2">
                        {tables.includes("personal_info") ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-amber-500" />
                        )}
                      </div>
                      <span>personal_info</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 mr-2">
                        {tables.includes("employment_info") ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-amber-500" />
                        )}
                      </div>
                      <span>employment_info</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Button onClick={setupTables} disabled={setupLoading}>
              {setupLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Database className="mr-2 h-4 w-4" />
              Setup Required Tables
            </Button>

            <Button onClick={setupPendingTable} disabled={setupPendingLoading} variant="secondary">
              {setupPendingLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <TableProperties className="mr-2 h-4 w-4" />
              Setup Pending Table
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Employees</CardTitle>
            <CardDescription>Seed test data for pending employees to test the approval workflow.</CardDescription>
          </CardHeader>
          <CardContent>
            <SeedPendingButton />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Database Structure</h2>
        <CheckPendingTableButton />
      </div>

      {Object.keys(tableStructures).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Table Structures</CardTitle>
            <CardDescription>Detailed structure of key tables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(tableStructures).map(([tableName, columns]) => (
                <div key={tableName} className="space-y-2">
                  <h3 className="text-lg font-medium">{tableName}</h3>
                  <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-border">
                      <thead>
                        <tr className="divide-x divide-border">
                          <th className="px-4 py-2 text-left text-sm font-medium">Column</th>
                          <th className="px-4 py-2 text-left text-sm font-medium">Type</th>
                          <th className="px-4 py-2 text-left text-sm font-medium">Nullable</th>
                          <th className="px-4 py-2 text-left text-sm font-medium">Default</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {columns.map((column: any, index: number) => (
                          <tr key={index} className="divide-x divide-border">
                            <td className="px-4 py-2 text-sm">{column.column_name}</td>
                            <td className="px-4 py-2 text-sm">{column.data_type}</td>
                            <td className="px-4 py-2 text-sm">{column.is_nullable === "YES" ? "Yes" : "No"}</td>
                            <td className="px-4 py-2 text-sm">{column.column_default || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
