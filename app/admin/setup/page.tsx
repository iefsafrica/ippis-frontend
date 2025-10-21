"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2, Database, Server, Shield, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

export default function AdminSetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("database")
  const [setupProgress, setSetupProgress] = useState(0)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    details?: string
  } | null>(null)
  const { toast } = useToast()

  const setupDatabase = async () => {
    setIsLoading(true)
    setResult(null)
    setSetupProgress(0)

    try {
      const token = prompt("Please enter the admin setup token:")

      if (!token) {
        setResult({
          success: false,
          message: "Setup token is required",
        })
        setIsLoading(false)
        return
      }

      // Progress simulation
      const interval = setInterval(() => {
        setSetupProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval)
            return prev
          }
          return prev + 10
        })
      }, 300)

      // Database setup API call
      const response = await fetch("/api/admin/db-setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      clearInterval(interval)
      setSetupProgress(100)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to set up database")
      }

      setResult({
        success: true,
        message: data.message || "Database setup completed successfully",
      })

      toast({
        title: "Success",
        description: "Database setup completed successfully",
      })
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
        details: error instanceof Error ? error.message : undefined,
      })

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to set up database",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const setupUsers = async () => {
    setIsLoading(true)
    setResult(null)
    setSetupProgress(0)

    try {
      const token = prompt("Please enter the admin setup token:")

      if (!token) {
        setResult({
          success: false,
          message: "Setup token is required",
        })
        setIsLoading(false)
        return
      }

      // Progress simulation
      const interval = setInterval(() => {
        setSetupProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval)
            return prev
          }
          return prev + 10
        })
      }, 300)

      // User setup API call
      const response = await fetch("/api/admin/users-setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      clearInterval(interval)
      setSetupProgress(100)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to set up users")
      }

      setResult({
        success: true,
        message: data.message || "User setup completed successfully",
        details: data.defaultCredentials
          ? `Default credentials created:\n${data.defaultCredentials
              .map((cred: any) => `- ${cred.username} (${cred.role}): ${cred.password}`)
              .join("\n")}`
          : undefined,
      })

      toast({
        title: "Success",
        description: "User setup completed successfully",
      })
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
        details: error instanceof Error ? error.message : undefined,
      })

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to set up users",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const setupPermissions = async () => {
    setIsLoading(true)
    setResult(null)
    setSetupProgress(0)

    try {
      const token = prompt("Please enter the admin setup token:")

      if (!token) {
        setResult({
          success: false,
          message: "Setup token is required",
        })
        setIsLoading(false)
        return
      }

      // Progress simulation
      const interval = setInterval(() => {
        setSetupProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval)
            return prev
          }
          return prev + 10
        })
      }, 300)

      // Permissions setup API call
      const response = await fetch("/api/admin/permissions-setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      clearInterval(interval)
      setSetupProgress(100)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to set up permissions")
      }

      setResult({
        success: true,
        message: data.message || "Permissions setup completed successfully",
      })

      toast({
        title: "Success",
        description: "Permissions setup completed successfully",
      })
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
        details: error instanceof Error ? error.message : undefined,
      })

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to set up permissions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const setupSystem = async () => {
    setIsLoading(true)
    setResult(null)
    setSetupProgress(0)

    try {
      const token = prompt("Please enter the admin setup token:")

      if (!token) {
        setResult({
          success: false,
          message: "Setup token is required",
        })
        setIsLoading(false)
        return
      }

      // Progress simulation
      const interval = setInterval(() => {
        setSetupProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval)
            return prev
          }
          return prev + 10
        })
      }, 300)

      // System setup API call
      const response = await fetch("/api/admin/system-setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      clearInterval(interval)
      setSetupProgress(100)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to set up system")
      }

      setResult({
        success: true,
        message: data.message || "System setup completed successfully",
      })

      toast({
        title: "Success",
        description: "System setup completed successfully",
      })
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
        details: error instanceof Error ? error.message : undefined,
      })

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to set up system",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Admin System Setup</CardTitle>
          <CardDescription>Initialize and configure the IPPIS admin system</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="database" disabled={isLoading}>
                <Database className="mr-2 h-4 w-4" />
                Database
              </TabsTrigger>
              <TabsTrigger value="users" disabled={isLoading}>
                <Users className="mr-2 h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="permissions" disabled={isLoading}>
                <Shield className="mr-2 h-4 w-4" />
                Permissions
              </TabsTrigger>
              <TabsTrigger value="system" disabled={isLoading}>
                <Server className="mr-2 h-4 w-4" />
                System
              </TabsTrigger>
            </TabsList>

            {isLoading && (
              <div className="mt-4">
                <Progress value={setupProgress} className="h-2" />
                <p className="mt-2 text-center text-sm text-gray-500">Setting up... {setupProgress}%</p>
              </div>
            )}

            {result && (
              <Alert className={`mt-4 ${result.success ? "bg-green-50" : "bg-red-50"}`}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription className="whitespace-pre-line">
                  {result.message}
                  {result.details && (
                    <>
                      <br />
                      <br />
                      {result.details}
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <TabsContent value="database" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Database Setup</h3>
                <p className="text-sm text-gray-500">
                  Initialize the database with required tables and default settings. This will create:
                </p>
                <ul className="list-disc pl-5 text-sm text-gray-500">
                  <li>Admin users and authentication tables</li>
                  <li>Employee and document management tables</li>
                  <li>System settings and configuration tables</li>
                  <li>Activity logging and audit tables</li>
                </ul>
                <p className="text-sm font-medium text-amber-600">
                  Note: This operation should only be performed once during initial setup.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="users" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">User Setup</h3>
                <p className="text-sm text-gray-500">Create default admin users and roles. This will set up:</p>
                <ul className="list-disc pl-5 text-sm text-gray-500">
                  <li>Default superadmin account</li>
                  <li>Standard admin roles (Admin, Manager, Viewer)</li>
                  <li>User authentication settings</li>
                </ul>
                <p className="text-sm font-medium text-amber-600">
                  Note: The default superadmin password will be provided after setup.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Permissions Setup</h3>
                <p className="text-sm text-gray-500">
                  Configure role-based access control for the system. This will set up:
                </p>
                <ul className="list-disc pl-5 text-sm text-gray-500">
                  <li>Permission definitions for all system resources</li>
                  <li>Role-permission mappings</li>
                  <li>Access control policies</li>
                </ul>
                <p className="text-sm font-medium text-amber-600">
                  Note: Default permissions will be assigned based on standard security practices.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="system" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">System Setup</h3>
                <p className="text-sm text-gray-500">Configure system-wide settings and defaults. This will set up:</p>
                <ul className="list-disc pl-5 text-sm text-gray-500">
                  <li>Email notification settings</li>
                  <li>Document verification workflows</li>
                  <li>Backup and maintenance schedules</li>
                  <li>System logging and monitoring</li>
                </ul>
                <p className="text-sm font-medium text-amber-600">
                  Note: These settings can be modified later in the admin dashboard.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => {
              switch (activeTab) {
                case "database":
                  setupDatabase()
                  break
                case "users":
                  setupUsers()
                  break
                case "permissions":
                  setupPermissions()
                  break
                case "system":
                  setupSystem()
                  break
              }
            }}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              `Set Up ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
