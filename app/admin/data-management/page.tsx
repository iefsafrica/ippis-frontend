import { ClearAllDataButton } from "../components/clear-all-data-button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, Upload, Download, RefreshCw, AlertTriangle } from "lucide-react"

export default function DataManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Management</h1>
        <p className="text-muted-foreground">Manage system data and perform maintenance operations.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Data Cleanup</CardTitle>
            <CardDescription>Remove all data from the system to start fresh.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This will permanently delete all employees, pending registrations, and documents from the system. This
              action cannot be undone.
            </p>
          </CardContent>
          <CardFooter>
            <ClearAllDataButton />
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Setup</CardTitle>
            <CardDescription>Initialize or reset database tables.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Create or recreate the necessary database tables for the system to function properly.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-4">
            <Button className="gap-2">
              <Database className="h-4 w-4" />
              Setup Database Tables
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import/Export</CardTitle>
            <CardDescription>Import or export system data.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Import data from CSV files or export current data to various formats.
            </p>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-4">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Import Data
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="bg-amber-50 border-b border-amber-100">
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription className="text-amber-700">These actions can cause data loss.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-4">Advanced operations that should be used with caution.</p>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-4">
            <Button variant="destructive" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reset System
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
