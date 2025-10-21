"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// Import the HelpCleanupButton component
import { HelpCleanupButton } from "./help-cleanup-button"
import { MigratePendingTableButton } from "./migrate-pending-table-button"
import { RemoveNameColumnButton } from "./remove-name-column-button"
import { RearrangeColumnsButton } from "./rearrange-columns-button"
import { Separator } from "@/components/ui/separator"

interface SettingsProps {
  initialSettings?: any
}

export function SettingsContent({ initialSettings = {} }: SettingsProps) {
  const [settings, setSettings] = useState({
    emailNotifications: initialSettings.emailNotifications ?? true,
    systemNotifications: initialSettings.systemNotifications ?? true,
    documentVerificationMode: initialSettings.documentVerificationMode ?? "manual",
    systemName: initialSettings.systemName ?? "IPPIS Admin Portal",
    systemLogo: initialSettings.systemLogo ?? "",
    systemTheme: initialSettings.systemTheme ?? "light",
    systemLanguage: initialSettings.systemLanguage ?? "en",
    systemTimezone: initialSettings.systemTimezone ?? "Africa/Lagos",
    systemDateFormat: initialSettings.systemDateFormat ?? "DD/MM/YYYY",
    systemTimeFormat: initialSettings.systemTimeFormat ?? "HH:mm",
    systemCurrency: initialSettings.systemCurrency ?? "NGN",
    systemDecimalSeparator: initialSettings.systemDecimalSeparator ?? ".",
    systemThousandSeparator: initialSettings.systemThousandSeparator ?? ",",
  })

  const [testEmailAddress, setTestEmailAddress] = useState("")
  const [saving, setSaving] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)
  const [emailTestResult, setEmailTestResult] = useState<{
    success?: boolean
    message?: string
    error?: string
    details?: any
  } | null>(null)
  const { toast } = useToast()

  const handleChange = (field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...settings,
          updatedBy: "admin", // Add the updatedBy field required by the API
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to save settings: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Settings saved",
          description: "Your settings have been saved successfully.",
        })
      } else {
        throw new Error(data.error || "Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTestEmail = async () => {
    if (!testEmailAddress) {
      toast({
        title: "Error",
        description: "Please enter an email address for testing.",
        variant: "destructive",
      })
      return
    }

    setTestingEmail(true)
    setEmailTestResult(null)

    try {
      const response = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: testEmailAddress }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send test email")
      }

      setEmailTestResult({
        success: true,
        message: "Test email sent successfully! Please check your inbox.",
        details: data.details,
      })

      toast({
        title: "Success",
        description: "Test email sent successfully! Please check your inbox.",
      })
    } catch (error) {
      console.error("Error sending test email:", error)

      setEmailTestResult({
        success: false,
        error: error instanceof Error ? error.message : "Failed to send test email",
      })

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send test email",
        variant: "destructive",
      })
    } finally {
      setTestingEmail(false)
    }
  }

  const resetEmailTest = () => {
    setEmailTestResult(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your system settings and preferences.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure general system settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="systemName">System Name</Label>
                <Input
                  id="systemName"
                  value={settings.systemName}
                  onChange={(e) => handleChange("systemName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="systemLogo">System Logo URL</Label>
                <Input
                  id="systemLogo"
                  value={settings.systemLogo}
                  onChange={(e) => handleChange("systemLogo", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="systemLanguage">Language</Label>
                <Select
                  value={settings.systemLanguage}
                  onValueChange={(value) => handleChange("systemLanguage", value)}
                >
                  <SelectTrigger id="systemLanguage">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="ha">Hausa</SelectItem>
                    <SelectItem value="ig">Igbo</SelectItem>
                    <SelectItem value="yo">Yoruba</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="systemTimezone">Timezone</Label>
                <Select
                  value={settings.systemTimezone}
                  onValueChange={(value) => handleChange("systemTimezone", value)}
                >
                  <SelectTrigger id="systemTimezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Africa/Lagos">Africa/Lagos</SelectItem>
                    <SelectItem value="Africa/Abuja">Africa/Abuja</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email.</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleChange("emailNotifications", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="systemNotifications">System Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications within the system.</p>
                </div>
                <Switch
                  id="systemNotifications"
                  checked={settings.systemNotifications}
                  onCheckedChange={(checked) => handleChange("systemNotifications", checked)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>Configure email server settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testEmail">Test Email Configuration</Label>
                <div className="flex space-x-2">
                  <Input
                    id="testEmail"
                    type="email"
                    placeholder="Enter email address for testing"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    disabled={testingEmail}
                  />
                  <Button onClick={handleTestEmail} disabled={testingEmail || !testEmailAddress}>
                    {testingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Test"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Send a test email to verify your email configuration.
                </p>
              </div>

              {emailTestResult && (
                <div className="mt-4">
                  {emailTestResult.success ? (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">Success!</AlertTitle>
                      <AlertDescription className="text-green-700">
                        {emailTestResult.message}
                        {emailTestResult.details && (
                          <div className="mt-2 text-xs">
                            <p>Sent to: {emailTestResult.details.to}</p>
                            <p>From: {emailTestResult.details.from}</p>
                            <p>Subject: {emailTestResult.details.subject}</p>
                          </div>
                        )}
                      </AlertDescription>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 text-green-700 border-green-300 hover:bg-green-100"
                        onClick={resetEmailTest}
                      >
                        <RefreshCw className="mr-2 h-3 w-3" />
                        Test Again
                      </Button>
                    </Alert>
                  ) : (
                    <Alert className="bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertTitle className="text-red-800">Error</AlertTitle>
                      <AlertDescription className="text-red-700">{emailTestResult.error}</AlertDescription>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 text-red-700 border-red-300 hover:bg-red-100"
                        onClick={resetEmailTest}
                      >
                        <RefreshCw className="mr-2 h-3 w-3" />
                        Try Again
                      </Button>
                    </Alert>
                  )}
                </div>
              )}

              <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-md">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Email Configuration</h3>
                <p className="text-xs text-blue-700">
                  Email settings are configured using environment variables. If you need to change these settings,
                  please update the environment variables in your Vercel project settings.
                </p>
                <ul className="mt-2 text-xs text-blue-700 list-disc list-inside">
                  <li>EMAIL_SERVER: SMTP server address</li>
                  <li>EMAIL_PORT: SMTP server port</li>
                  <li>EMAIL_USER: SMTP username</li>
                  <li>EMAIL_PASS: SMTP password</li>
                  <li>EMAIL_FROM: Default sender email address</li>
                  <li>EMAIL_REPLY_TO: Reply-to email address (optional)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of the system.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="systemTheme">Theme</Label>
                <Select value={settings.systemTheme} onValueChange={(value) => handleChange("systemTheme", value)}>
                  <SelectTrigger id="systemTheme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Configure advanced system settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="documentVerificationMode">Document Verification Mode</Label>
                <Select
                  value={settings.documentVerificationMode}
                  onValueChange={(value) => handleChange("documentVerificationMode", value)}
                >
                  <SelectTrigger id="documentVerificationMode">
                    <SelectValue placeholder="Select verification mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="systemDateFormat">Date Format</Label>
                <Select
                  value={settings.systemDateFormat}
                  onValueChange={(value) => handleChange("systemDateFormat", value)}
                >
                  <SelectTrigger id="systemDateFormat">
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="systemTimeFormat">Time Format</Label>
                <Select
                  value={settings.systemTimeFormat}
                  onValueChange={(value) => handleChange("systemTimeFormat", value)}
                >
                  <SelectTrigger id="systemTimeFormat">
                    <SelectValue placeholder="Select time format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HH:mm">24-hour (HH:mm)</SelectItem>
                    <SelectItem value="hh:mm A">12-hour (hh:mm AM/PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-medium mb-2">Database Migrations</h3>
                <p className="text-sm text-muted-foreground mb-4">Update database tables to support new features.</p>
                <MigratePendingTableButton />

                <div className="mt-4 pt-4 border-t">
                  <RemoveNameColumnButton />

                  <Separator />

                  <RearrangeColumnsButton />

                  <Separator />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-medium mb-2">Database Cleanup</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Remove deprecated or unused database tables from the system.
                </p>
                <HelpCleanupButton />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
