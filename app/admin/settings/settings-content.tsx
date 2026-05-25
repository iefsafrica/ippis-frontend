"use client"

import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useUpdateAdvancedSettings, useUpdateAppearanceSettings, useUpdateEmailSettings, useUpdateSettings } from "@/services/hooks/settings"
import type { SettingsFormState } from "@/types/settings"
import { DEFAULT_SETTINGS_FORM_STATE } from "@/types/settings"
import { AlertCircle, CheckCircle, Loader2, RefreshCw, Save } from "lucide-react"
import { HelpCleanupButton } from "./help-cleanup-button"
import { MigratePendingTableButton } from "./migrate-pending-table-button"
import { RearrangeColumnsButton } from "./rearrange-columns-button"
import { RemoveNameColumnButton } from "./remove-name-column-button"

interface SettingsProps {
  initialSettings?: Partial<SettingsFormState>
}

type SaveSection = "general" | "notifications" | "email" | "appearance" | "advanced"

const mergeSettings = (settings?: Partial<SettingsFormState>): SettingsFormState => ({
  ...DEFAULT_SETTINGS_FORM_STATE,
  ...(settings ?? {}),
})

export function SettingsContent({ initialSettings }: SettingsProps) {
  const [settings, setSettings] = useState<SettingsFormState>(() => mergeSettings(initialSettings))
  const [testEmailAddress, setTestEmailAddress] = useState("")
  const [savingSection, setSavingSection] = useState<SaveSection | null>(null)
  const [testingEmail, setTestingEmail] = useState(false)
  const [emailTestResult, setEmailTestResult] = useState<{
    success?: boolean
    message?: string
    error?: string
    details?: { to?: string; from?: string; subject?: string }
  } | null>(null)
  const { toast } = useToast()

  const updateSettingsMutation = useUpdateSettings()
  const updateAdvancedMutation = useUpdateAdvancedSettings()
  const updateAppearanceMutation = useUpdateAppearanceSettings()
  const updateEmailMutation = useUpdateEmailSettings()

  const handleChange = <K extends keyof SettingsFormState>(field: K, value: SettingsFormState[K]) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveGeneral = async () => {
    setSavingSection("general")
    try {
      await updateSettingsMutation.mutateAsync({
        systemName: settings.systemName,
        systemLogo: settings.systemLogo,
        systemLanguage: settings.systemLanguage,
        systemTimezone: settings.systemTimezone,
        updatedBy: "admin",
      })
    } catch {
      // Error toast is handled by the mutation hook.
    } finally {
      setSavingSection(null)
    }
  }

  const handleSaveNotifications = async () => {
    setSavingSection("notifications")
    try {
      await updateSettingsMutation.mutateAsync({
        emailNotifications: settings.emailNotifications,
        systemNotifications: settings.systemNotifications,
        updatedBy: "admin",
      })
    } catch {
      // Error toast is handled by the mutation hook.
    } finally {
      setSavingSection(null)
    }
  }

  const handleSaveAdvanced = async () => {
    setSavingSection("advanced")
    try {
      await updateAdvancedMutation.mutateAsync({
        documentVerificationMode: settings.documentVerificationMode,
        systemDateFormat: settings.systemDateFormat,
        systemTimeFormat: settings.systemTimeFormat,
        systemCurrency: settings.systemCurrency,
        systemDecimalSeparator: settings.systemDecimalSeparator,
        systemThousandSeparator: settings.systemThousandSeparator,
        debugMode: settings.debugMode,
        maintenanceMode: settings.maintenanceMode,
        updatedBy: "admin",
      })
    } catch {
      // Error toast is handled by the mutation hook.
    } finally {
      setSavingSection(null)
    }
  }

  const handleSaveAppearance = async () => {
    setSavingSection("appearance")
    try {
      await updateAppearanceMutation.mutateAsync({
        systemTheme: settings.systemTheme,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        fontFamily: settings.fontFamily,
        updatedBy: "admin",
      })
    } catch {
      // Error toast is handled by the mutation hook.
    } finally {
      setSavingSection(null)
    }
  }

  const handleSaveEmail = async () => {
    setSavingSection("email")
    try {
      await updateEmailMutation.mutateAsync({
        emailServer: settings.emailServer,
        emailPort: settings.emailPort,
        emailUsername: settings.emailUsername,
        emailPassword: settings.emailPassword,
        emailFrom: settings.emailFrom,
        emailReplyTo: settings.emailReplyTo,
        emailTemplate: settings.emailTemplate,
        updatedBy: "admin",
      })
    } catch {
      // Error toast is handled by the mutation hook.
    } finally {
      setSavingSection(null)
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

  const isSaving = (section: SaveSection) => savingSection === section

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your system settings and preferences.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="flex flex-wrap gap-2">
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
              <CardDescription>Configure the basic identity and locale settings for the system.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
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
              <Button onClick={handleSaveGeneral} disabled={isSaving("general")}>
                {isSaving("general") ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how the platform notifies users and administrators.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-6 rounded-lg border p-4">
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
              <div className="flex items-center justify-between gap-6 rounded-lg border p-4">
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
              <Button onClick={handleSaveNotifications} disabled={isSaving("notifications")}>
                {isSaving("notifications") ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>Configure the SMTP connection used for outgoing email.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emailServer">Email Server</Label>
                <Input
                  id="emailServer"
                  value={settings.emailServer}
                  onChange={(e) => handleChange("emailServer", e.target.value)}
                  placeholder="smtp.company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailPort">Email Port</Label>
                <Input
                  id="emailPort"
                  value={settings.emailPort}
                  onChange={(e) => handleChange("emailPort", e.target.value)}
                  placeholder="587"
                  inputMode="numeric"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailUsername">Email Username</Label>
                <Input
                  id="emailUsername"
                  value={settings.emailUsername}
                  onChange={(e) => handleChange("emailUsername", e.target.value)}
                  placeholder="admin@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailPassword">Email Password</Label>
                <Input
                  id="emailPassword"
                  type="password"
                  value={settings.emailPassword}
                  onChange={(e) => handleChange("emailPassword", e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailFrom">Email From</Label>
                <Input
                  id="emailFrom"
                  value={settings.emailFrom}
                  onChange={(e) => handleChange("emailFrom", e.target.value)}
                  placeholder="noreply@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailReplyTo">Reply-To Email</Label>
                <Input
                  id="emailReplyTo"
                  value={settings.emailReplyTo}
                  onChange={(e) => handleChange("emailReplyTo", e.target.value)}
                  placeholder="support@company.com"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="emailTemplate">Email Template</Label>
                <Select
                  value={settings.emailTemplate}
                  onValueChange={(value) => handleChange("emailTemplate", value)}
                >
                  <SelectTrigger id="emailTemplate">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-3">
              <Button onClick={handleSaveEmail} disabled={isSaving("email")}>
                {isSaving("email") ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Email Settings
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Email Configuration</CardTitle>
              <CardDescription>Send a test email to verify the SMTP settings above.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testEmail">Test Email Address</Label>
                <div className="flex flex-col gap-2 md:flex-row">
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
                <p className="text-xs text-muted-foreground">Send a test email to verify the configuration.</p>
              </div>

              {emailTestResult && (
                <div className="mt-4">
                  {emailTestResult.success ? (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">Success</AlertTitle>
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
                        className="mt-3 text-green-700 border-green-300 hover:bg-green-100"
                        onClick={resetEmailTest}
                      >
                        <RefreshCw className="mr-2 h-3 w-3" />
                        Test Again
                      </Button>
                    </Alert>
                  ) : (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertTitle className="text-red-800">Error</AlertTitle>
                      <AlertDescription className="text-red-700">{emailTestResult.error}</AlertDescription>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 text-red-700 border-red-300 hover:bg-red-100"
                        onClick={resetEmailTest}
                      >
                        <RefreshCw className="mr-2 h-3 w-3" />
                        Try Again
                      </Button>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of the system.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
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
              <div className="space-y-2">
                <Label htmlFor="fontFamily">Font Family</Label>
                <Select value={settings.fontFamily} onValueChange={(value) => handleChange("fontFamily", value)}>
                  <SelectTrigger id="fontFamily">
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Poppins">Poppins</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <Input
                  id="primaryColor"
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => handleChange("primaryColor", e.target.value)}
                  className="h-10 w-24 p-1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <Input
                  id="secondaryColor"
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => handleChange("secondaryColor", e.target.value)}
                  className="h-10 w-24 p-1"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveAppearance} disabled={isSaving("appearance")}>
                {isSaving("appearance") ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Configure advanced system behavior and formatting.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
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
              <div className="space-y-2">
                <Label htmlFor="systemCurrency">Currency</Label>
                <Input
                  id="systemCurrency"
                  value={settings.systemCurrency}
                  onChange={(e) => handleChange("systemCurrency", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="systemDecimalSeparator">Decimal Separator</Label>
                <Input
                  id="systemDecimalSeparator"
                  value={settings.systemDecimalSeparator}
                  onChange={(e) => handleChange("systemDecimalSeparator", e.target.value)}
                  maxLength={1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="systemThousandSeparator">Thousand Separator</Label>
                <Input
                  id="systemThousandSeparator"
                  value={settings.systemThousandSeparator}
                  onChange={(e) => handleChange("systemThousandSeparator", e.target.value)}
                  maxLength={1}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="debugMode">Debug Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable verbose diagnostics and logging.</p>
                </div>
                <Switch id="debugMode" checked={settings.debugMode} onCheckedChange={(checked) => handleChange("debugMode", checked)} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Temporarily restrict access while system work is in progress.</p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleChange("maintenanceMode", checked)}
                />
              </div>
              <div className="md:col-span-2 border-t pt-4 mt-2">
                <h3 className="text-lg font-medium mb-2">Database Migrations</h3>
                <p className="text-sm text-muted-foreground mb-4">Update database tables to support new features.</p>
                <MigratePendingTableButton />

                <div className="mt-4 pt-4 border-t">
                  <RemoveNameColumnButton />

                  <Separator className="my-4" />

                  <RearrangeColumnsButton />

                  <Separator className="my-4" />
                </div>
              </div>

              <div className="md:col-span-2 border-t pt-4 mt-2">
                <h3 className="text-lg font-medium mb-2">Database Cleanup</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Remove deprecated or unused database tables from the system.
                </p>
                <HelpCleanupButton />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveAdvanced} disabled={isSaving("advanced")}>
                {isSaving("advanced") ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
