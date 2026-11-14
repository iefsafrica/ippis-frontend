"use client"

import { useState, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRestructureOrganization } from "@/services/hooks/organizations/useRestructure"
import { useGetCompanies } from "@/services/hooks/organizations/company/useCompany"
import { useGetDepartments } from "@/services/hooks/organizations/department/useDepartment"
import type { RestructureResponse, LostAccessUser } from "@/types/organizations/restructure"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  GitMerge,
  ArrowRight,
  Building2,
  Users,
  Database,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  FileText,
  Loader2,
  Lock,
  ArrowLeftRight,
  Eye,
  Play,
  RotateCcw,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export function RestructureContent() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"move_department" | "merge_mda">("move_department")

  // Move Department State
  const [selectedDeptId, setSelectedDeptId] = useState<string>("")
  const [moveTargetCompanyId, setMoveTargetCompanyId] = useState<string>("")

  // Merge MDA State
  const [mergeSourceCompanyId, setMergeSourceCompanyId] = useState<string>("")
  const [mergeTargetCompanyId, setMergeTargetCompanyId] = useState<string>("")

  // Execution & Dry-run states
  const [isDryRun, setIsDryRun] = useState<boolean>(true)
  const [dryRunResult, setDryRunResult] = useState<RestructureResponse | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false)

  // API hooks
  const { data: companiesResponse, isLoading: isLoadingCompanies } = useGetCompanies()
  const { data: departmentsResponse, isLoading: isLoadingDepartments } = useGetDepartments()
  const restructureMutation = useRestructureOrganization()

  const companies = useMemo(() => companiesResponse?.data || [], [companiesResponse])
  const departments = useMemo(() => departmentsResponse?.data || [], [departmentsResponse])

  // Central admin check
  const isCentralAdmin = useMemo(() => {
    if (!user) return false
    const roleLower = (user.role || "").toLowerCase()
    const roleKeyLower = (user.role_key || "").toLowerCase()
    return (
      roleLower.includes("super") ||
      roleKeyLower.includes("super") ||
      roleLower.includes("central") ||
      roleKeyLower.includes("central")
    )
  }, [user])

  // Current department's current company
  const selectedDepartment = useMemo(() => {
    return departments.find((d) => String(d.id) === String(selectedDeptId))
  }, [departments, selectedDeptId])

  const selectedDepartmentCompany = useMemo(() => {
    if (!selectedDepartment?.company_id) return null
    return companies.find((c) => String(c.id) === String(selectedDepartment.company_id))
  }, [companies, selectedDepartment])

  // Source & Target Companies for Merge
  const sourceCompany = useMemo(() => {
    return companies.find((c) => String(c.id) === String(mergeSourceCompanyId))
  }, [companies, mergeSourceCompanyId])

  const targetCompany = useMemo(() => {
    return companies.find((c) => String(c.id) === String(mergeTargetCompanyId))
  }, [companies, mergeTargetCompanyId])

  // Handlers
  const handlePerformDryRun = async () => {
    setDryRunResult(null)
    if (activeTab === "move_department") {
      if (!selectedDeptId) {
        toast.error("Please select a department to move")
        return
      }
      if (!moveTargetCompanyId) {
        toast.error("Please select a destination MDA")
        return
      }
      if (selectedDepartment?.company_id && String(selectedDepartment.company_id) === String(moveTargetCompanyId)) {
        toast.error("Destination MDA must be different from current MDA")
        return
      }

      try {
        const res = await restructureMutation.mutateAsync({
          action: "move_department",
          department_id: selectedDeptId,
          target_company_id: moveTargetCompanyId,
          dry_run: true,
        })
        setDryRunResult(res)
        toast.info("Dry run completed", {
          description: "Previewing what records and staff will move.",
        })
      } catch (err: any) {
        toast.error(err.message || "Dry run simulation failed")
      }
    } else {
      if (!mergeSourceCompanyId) {
        toast.error("Please select the source MDA to merge")
        return
      }
      if (!mergeTargetCompanyId) {
        toast.error("Please select the target MDA")
        return
      }
      if (mergeSourceCompanyId === mergeTargetCompanyId) {
        toast.error("Source and target MDAs cannot be the same")
        return
      }

      try {
        const res = await restructureMutation.mutateAsync({
          action: "merge_mda",
          source_company_id: mergeSourceCompanyId,
          target_company_id: mergeTargetCompanyId,
          dry_run: true,
        })
        setDryRunResult(res)
        toast.info("Dry run completed", {
          description: "Review safety warnings and users who will lose access.",
        })
      } catch (err: any) {
        toast.error(err.message || "Dry run simulation failed")
      }
    }
  }

  const handleExecuteLive = async () => {
    try {
      if (activeTab === "move_department") {
        await restructureMutation.mutateAsync({
          action: "move_department",
          department_id: selectedDeptId,
          target_company_id: moveTargetCompanyId,
          dry_run: false,
        })
        toast.success("Department moved successfully", {
          description: "Staff and records have been transferred to the new MDA.",
        })
      } else {
        await restructureMutation.mutateAsync({
          action: "merge_mda",
          source_company_id: mergeSourceCompanyId,
          target_company_id: mergeTargetCompanyId,
          dry_run: false,
        })
        toast.success("MDA merged successfully", {
          description: "Source MDA has been deactivated and records moved.",
        })
      }
      setIsConfirmDialogOpen(false)
      setDryRunResult(null)
    } catch (err: any) {
      toast.error(err.message || "Failed to execute organization restructure")
    }
  }

  if (!isCentralAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <div className="h-16 w-16 bg-rose-50 rounded-2xl border border-rose-200 flex items-center justify-center mx-auto mb-4 text-rose-600">
          <Lock className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Restricted Access</h2>
        <p className="text-sm text-slate-600 mt-2">
          Organization restructuring (moving departments and merging MDAs) is restricted to Central
          Administrators only.
        </p>
        <Link href="/admin/organization/company">
          <Button variant="outline" className="mt-6 text-xs">
            Return to MDAs
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-800 mb-2">
            <GitMerge className="h-3.5 w-3.5" />
            Central Admin Tool
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            MDA Restructuring & Reorganization
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Move departments between MDAs or merge an entire MDA into another. Use dry-run preview to
            inspect affected staff and records safely before applying changes.
          </p>
        </div>
        <Link href="/admin/organization/company">
          <Button variant="outline" className="h-10 text-xs">
            Back to MDAs
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val as "move_department" | "merge_mda")
          setDryRunResult(null)
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 max-w-md bg-slate-100 p-1">
          <TabsTrigger value="move_department" className="text-xs font-semibold">
            Move Department
          </TabsTrigger>
          <TabsTrigger value="merge_mda" className="text-xs font-semibold">
            Merge MDA
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Move Department */}
        <TabsContent value="move_department" className="mt-6 space-y-6">
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base font-semibold text-slate-900">
                Move Department to Another MDA
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Moves the selected department along with all its staff, records, and department-level
                access to the destination MDA.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700">
                    Department to Move <span className="text-rose-500">*</span>
                  </Label>
                  <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={String(dept.id)}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedDepartmentCompany && (
                    <p className="text-xs text-slate-500 pt-1">
                      Currently belongs to:{" "}
                      <span className="font-semibold text-slate-800">
                        {selectedDepartmentCompany.name}
                      </span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700">
                    Destination MDA <span className="text-rose-500">*</span>
                  </Label>
                  <Select value={moveTargetCompanyId} onValueChange={setMoveTargetCompanyId}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select destination MDA" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name} {c.code ? `(${c.code})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 pt-1">
                    Staff will be transferred under this MDA&apos;s jurisdiction.
                  </p>
                </div>
              </div>

              <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-4 text-xs text-indigo-900 flex items-start gap-3">
                <ArrowLeftRight className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold">Department-level access is preserved. </span>
                  Staff assigned roles specific to this department will retain them in the new MDA.
                  Always execute a dry run first to inspect affected employee records.
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Dry-run simulation is recommended before executing.
              </span>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handlePerformDryRun}
                  disabled={restructureMutation.isPending || !selectedDeptId || !moveTargetCompanyId}
                  variant="outline"
                  className="h-10 text-xs font-semibold border-slate-300"
                >
                  <Eye className="mr-1.5 h-3.5 w-3.5 text-slate-600" />
                  Preview Dry Run
                </Button>
                <Button
                  onClick={() => setIsConfirmDialogOpen(true)}
                  disabled={restructureMutation.isPending || !selectedDeptId || !moveTargetCompanyId}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white h-10 px-5 text-xs font-semibold shadow-sm"
                >
                  Proceed to Move
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Tab 2: Merge MDA */}
        <TabsContent value="merge_mda" className="mt-6 space-y-6">
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base font-semibold text-slate-900">
                Merge an MDA into Another
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Transfers all departments, staff, and records from the source MDA into the target MDA.
                The old MDA becomes inactive.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700">
                    Source MDA (Will become inactive) <span className="text-rose-500">*</span>
                  </Label>
                  <Select value={mergeSourceCompanyId} onValueChange={setMergeSourceCompanyId}>
                    <SelectTrigger className="h-11 border-rose-200 focus:ring-rose-500">
                      <SelectValue placeholder="Select MDA to merge" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name} {c.code ? `(${c.code})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700">
                    Target MDA (Receiving MDA) <span className="text-rose-500">*</span>
                  </Label>
                  <Select value={mergeTargetCompanyId} onValueChange={setMergeTargetCompanyId}>
                    <SelectTrigger className="h-11 border-emerald-200 focus:ring-emerald-500">
                      <SelectValue placeholder="Select target MDA" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name} {c.code ? `(${c.code})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Safety Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  Important Security Policy: MDA-wide Access Removal
                </div>
                <p>
                  On a merge, <span className="font-semibold">MDA-wide access is removed by default for safety</span>.
                  Department-level access is preserved, but users with company-wide administrative roles
                  in the source MDA will lose them to prevent unintended permission escalation.
                </p>
                <p className="text-amber-800">
                  Run a dry run first to see the exact list of users who will lose MDA-wide access.
                </p>
              </div>
            </CardContent>

            <CardFooter className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Dry-run simulation is required before merge execution.
              </span>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handlePerformDryRun}
                  disabled={restructureMutation.isPending || !mergeSourceCompanyId || !mergeTargetCompanyId}
                  variant="outline"
                  className="h-10 text-xs font-semibold border-slate-300"
                >
                  <Eye className="mr-1.5 h-3.5 w-3.5 text-slate-600" />
                  Preview Dry Run
                </Button>
                <Button
                  onClick={() => setIsConfirmDialogOpen(true)}
                  disabled={restructureMutation.isPending || !mergeSourceCompanyId || !mergeTargetCompanyId}
                  className="bg-rose-600 hover:bg-rose-700 text-white h-10 px-5 text-xs font-semibold shadow-sm"
                >
                  Proceed to Merge
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dry Run Preview Cards */}
      {dryRunResult && (
        <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50 shadow-md">
          <CardHeader className="border-b border-indigo-100 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-600 text-white font-bold uppercase text-[10px] tracking-wider">
                  Dry Run Simulation
                </Badge>
                <span className="text-xs text-indigo-900 font-medium">
                  No changes were made to live database records
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDryRunResult(null)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Clear Preview
              </Button>
            </div>
            <CardTitle className="text-xl font-bold text-slate-900 mt-2">
              Simulation Results: {dryRunResult.message || "Ready for Execution"}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Metric counters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                <Users className="h-5 w-5 text-indigo-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-slate-900">
                  {dryRunResult.data?.affected_staff_count ?? 0}
                </div>
                <div className="text-xs text-slate-500">Staff Members Moving</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                <Database className="h-5 w-5 text-indigo-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-slate-900">
                  {dryRunResult.data?.affected_records_count ?? 0}
                </div>
                <div className="text-xs text-slate-500">Total Records Moving</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                <Building2 className="h-5 w-5 text-indigo-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-slate-900">
                  {dryRunResult.data?.departments_moved_count ?? (activeTab === "move_department" ? 1 : 0)}
                </div>
                <div className="text-xs text-slate-500">Departments Moving</div>
              </div>
            </div>

            {/* Lost Access Users List (for merge) */}
            {dryRunResult.data?.lost_access_users && dryRunResult.data.lost_access_users.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-rose-600" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Users Losing MDA-Wide Access ({dryRunResult.data.lost_access_users.length})
                  </h4>
                </div>
                <p className="text-xs text-slate-600">
                  For security, the following users will lose company-level access when the source MDA
                  is merged and deactivated:
                </p>

                <div className="border border-rose-200 rounded-lg overflow-hidden bg-rose-50/30">
                  <div className="divide-y divide-rose-100 max-h-56 overflow-y-auto">
                    {dryRunResult.data.lost_access_users.map((lostUser: LostAccessUser) => (
                      <div key={lostUser.id} className="p-3 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-slate-900">{lostUser.name}</span>
                          <span className="text-slate-500 ml-2">({lostUser.email})</span>
                        </div>
                        <Badge variant="outline" className="border-rose-200 text-rose-700 bg-white">
                          Role: {lostUser.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="bg-indigo-50/50 p-4 border-t border-indigo-100 flex items-center justify-between">
            <span className="text-xs text-indigo-900">
              Verified safe. Ready to apply changes to database.
            </span>
            <Button
              onClick={() => setIsConfirmDialogOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-5"
            >
              Confirm and Execute Live
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              Confirm {activeTab === "move_department" ? "Department Move" : "MDA Merge"}
            </DialogTitle>
            <DialogDescription>
              {activeTab === "move_department" ? (
                <span>
                  Are you sure you want to move{" "}
                  <strong className="text-slate-900">{selectedDepartment?.name}</strong> to{" "}
                  <strong className="text-slate-900">
                    {companies.find((c) => String(c.id) === String(moveTargetCompanyId))?.name}
                  </strong>
                  ? This will transfer all staff and records immediately.
                </span>
              ) : (
                <span>
                  Are you sure you want to merge{" "}
                  <strong className="text-slate-900">{sourceCompany?.name}</strong> into{" "}
                  <strong className="text-slate-900">{targetCompany?.name}</strong>?{" "}
                  <span className="text-rose-600 font-semibold">
                    The source MDA will be permanently marked inactive and company-wide access removed.
                  </span>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600">
            This action modifies organizational hierarchy across payroll, projects, and employees.
            Central administrator audit logging will record this operation.
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
              disabled={restructureMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleExecuteLive}
              disabled={restructureMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {restructureMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Executing...
                </>
              ) : (
                "Yes, Execute Restructure"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
