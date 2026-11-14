"use client"

import { useState, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import {
  useGetPayrollRuns,
  usePreparePayrollRun,
  useApprovePayrollRun,
  useRejectPayrollRun,
} from "@/services/hooks/payroll/usePayrollRuns"
import { useGetCompanies } from "@/services/hooks/organizations/company/useCompany"
import type { PayrollRun, SkippedEmployee, PreparePayrollRunPayload } from "@/types/payroll-runs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Wallet,
  Building2,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Plus,
  Search,
  Eye,
  FileCheck,
  AlertTriangle,
  Send,
  Trash2,
  ShieldCheck,
  ArrowRight,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import Link from "next/link"

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
]

const YEARS = ["2026", "2025", "2024"]

export function PayrollRunsContent() {
  const { user } = useAuth()
  const currentDate = new Date()
  const currentMonth = String(currentDate.getMonth() + 1)
  const currentYear = String(currentDate.getFullYear())

  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>("all")
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Prepare Run Modal State
  const [isPrepareOpen, setIsPrepareOpen] = useState(false)
  const [targetCompanyId, setTargetCompanyId] = useState<string>("")
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth)
  const [selectedYear, setSelectedYear] = useState<string>(currentYear)

  // Details & Skipped Modal State
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // Reject Modal State
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  // Hooks
  const { data: companiesResponse } = useGetCompanies()
  const { data: runsResponse, isLoading: isLoadingRuns, refetch } = useGetPayrollRuns(
    selectedCompanyFilter !== "all" ? { company_id: selectedCompanyFilter } : undefined
  )

  const prepareMutation = usePreparePayrollRun()
  const approveMutation = useApprovePayrollRun()
  const rejectMutation = useRejectPayrollRun()

  const companies = useMemo(() => companiesResponse?.data || [], [companiesResponse])
  const runs: PayrollRun[] = useMemo(() => runsResponse?.data || [], [runsResponse])

  // Is current user central admin?
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

  // Default target company to user's company if not central admin
  const defaultUserCompanyId = useMemo(() => {
    return user?.company_id ? String(user.company_id) : ""
  }, [user])

  // Filtered runs
  const filteredRuns = useMemo(() => {
    return runs.filter((run) => {
      if (selectedStatusFilter !== "all" && run.status !== selectedStatusFilter) return false
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const company = (run.company_name || "").toLowerCase()
        const monthName = MONTHS.find((m) => String(m.value) === String(run.month))?.label.toLowerCase() || ""
        const year = String(run.year)
        const prep = (run.prepared_by_name || "").toLowerCase()
        return company.includes(query) || monthName.includes(query) || year.includes(query) || prep.includes(query)
      }
      return true
    })
  }, [runs, selectedStatusFilter, searchTerm])

  // Stats
  const stats = useMemo(() => {
    const total = runs.length
    const draft = runs.filter((r) => r.status === "draft").length
    const approved = runs.filter((r) => r.status === "approved").length
    const totalNet = runs
      .filter((r) => r.status === "approved")
      .reduce((sum, r) => sum + (Number(r.total_net) || 0), 0)
    return { total, draft, approved, totalNet }
  }, [runs])

  // Check if current user prepared this run (cannot approve their own prepared run)
  const isPreparer = (run: PayrollRun) => {
    if (!user) return false
    return String(run.prepared_by) === String(user.id) || (user.name && run.prepared_by_name === user.name)
  }

  // Handlers
  const handleOpenPrepare = () => {
    setTargetCompanyId(defaultUserCompanyId || (companies[0]?.id ? String(companies[0].id) : ""))
    setSelectedMonth(currentMonth)
    setSelectedYear(currentYear)
    setIsPrepareOpen(true)
  }

  const handlePrepareSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetCompanyId) {
      toast.error("Please select an MDA for the payroll run")
      return
    }

    try {
      const payload: PreparePayrollRunPayload = {
        company_id: targetCompanyId,
        month: selectedMonth,
        year: selectedYear,
      }
      const res = await prepareMutation.mutateAsync(payload)
      const skippedCount = res?.data?.skipped_employees?.length || 0
      toast.success("Payroll run prepared successfully", {
        description: skippedCount > 0
          ? `${skippedCount} employee(s) skipped (no salary structure or already paid). A different officer must approve the run.`
          : "Draft payroll records generated. A different officer must approve the run.",
      })
      setIsPrepareOpen(false)
      refetch()
    } catch (err: any) {
      toast.error(err.message || "Failed to prepare payroll run")
    }
  }

  const handleApprove = async (run: PayrollRun) => {
    if (isPreparer(run)) {
      toast.error("A different person must approve the payroll run. Nobody can approve their own prepared run.")
      return
    }

    try {
      await approveMutation.mutateAsync(run.id)
      toast.success("Payroll run approved!", {
        description: "Payment confirmed and all employees have been notified that their payslips are ready.",
      })
      refetch()
    } catch (err: any) {
      toast.error(err.message || "Failed to approve payroll run")
    }
  }

  const handleOpenReject = (run: PayrollRun) => {
    setSelectedRun(run)
    setRejectReason("")
    setIsRejectOpen(true)
  }

  const handleRejectConfirm = async () => {
    if (!selectedRun) return
    try {
      await rejectMutation.mutateAsync({
        runId: selectedRun.id,
        reason: rejectReason.trim(),
      })
      toast.success("Payroll run rejected", {
        description: "Draft payroll records have been deleted so it can be prepared again.",
      })
      setIsRejectOpen(false)
      setSelectedRun(null)
      refetch()
    } catch (err: any) {
      toast.error(err.message || "Failed to reject payroll run")
    }
  }

  const formatCurrency = (amount: number | string) => {
    const num = Number(amount) || 0
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(num)
  }

  const getMonthName = (monthNum: number | string) => {
    return MONTHS.find((m) => String(m.value) === String(monthNum))?.label || `Month ${monthNum}`
  }

  const getStatusBadge = (status: PayrollRun["status"]) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Approved & Paid</Badge>
      case "draft":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Draft (Pending Approval)</Badge>
      case "rejected":
        return <Badge className="bg-rose-100 text-rose-800 border-rose-200">Rejected & Cleared</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-2">
            <Wallet className="h-3.5 w-3.5" />
            MDA Monthly Payroll Processing
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Payroll Runs per MDA
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Prepare monthly payroll for an MDA. Employees without a salary structure or already paid are
            skipped. A separate officer approves the run to release payslips.
          </p>
        </div>

        <Button
          onClick={handleOpenPrepare}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-2 h-11 px-5"
        >
          <Plus className="h-4 w-4" />
          Prepare Payroll Run
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Runs</CardTitle>
            <Calendar className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <p className="text-xs text-slate-500 mt-1">MDA payroll run batches</p>
          </CardContent>
        </Card>

        <Card className="border border-amber-200 bg-amber-50/40 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">Pending Approval</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">{stats.draft}</div>
            <p className="text-xs text-amber-700 mt-1">Draft runs awaiting 2nd officer</p>
          </CardContent>
        </Card>

        <Card className="border border-emerald-200 bg-emerald-50/40 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">Approved Runs</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">{stats.approved}</div>
            <p className="text-xs text-emerald-700 mt-1">Payslips released to staff</p>
          </CardContent>
        </Card>

        <Card className="border border-blue-200 bg-blue-50/40 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Net Disbursed</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{formatCurrency(stats.totalNet)}</div>
            <p className="text-xs text-blue-700 mt-1">Across all approved batches</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table / List */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search MDA, month, preparer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-xs bg-white"
                />
              </div>

              {isCentralAdmin && (
                <Select value={selectedCompanyFilter} onValueChange={setSelectedCompanyFilter}>
                  <SelectTrigger className="h-9 w-48 text-xs bg-white">
                    <SelectValue placeholder="All MDAs" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="all">All MDAs</SelectItem>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
                <SelectTrigger className="h-9 w-36 text-xs bg-white">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-xs text-slate-500">
              Showing {filteredRuns.length} of {runs.length} runs
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoadingRuns ? (
            <div className="py-16 text-center text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600 mb-2" />
              Loading payroll runs...
            </div>
          ) : filteredRuns.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <Wallet className="h-10 w-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">No payroll runs found</p>
              <p className="text-xs text-slate-400 mt-1">
                Click &apos;Prepare Payroll Run&apos; to process a month&apos;s payroll for an MDA.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredRuns.map((run) => {
                const selfPrepared = isPreparer(run)
                const canApprove = run.status === "draft" && !selfPrepared
                const skippedCount = run.skipped_employees?.length || 0

                return (
                  <div
                    key={run.id}
                    className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">
                          {run.company_name}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-sm font-semibold text-emerald-800">
                          {getMonthName(run.month)} {run.year}
                        </span>
                        <span className="text-slate-400">•</span>
                        {getStatusBadge(run.status)}
                      </div>

                      {/* Financial numbers strip */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200/60">
                        <div>
                          <span className="text-slate-400">Employees Paid: </span>
                          <span className="font-bold text-slate-900">{run.total_employees}</span>
                        </div>
                        <span className="text-slate-300">|</span>
                        <div>
                          <span className="text-slate-400">Total Gross: </span>
                          <span className="font-medium text-slate-800">{formatCurrency(run.total_gross)}</span>
                        </div>
                        <span className="text-slate-300">|</span>
                        <div>
                          <span className="text-slate-400">Deductions: </span>
                          <span className="font-medium text-rose-700">{formatCurrency(run.total_deductions)}</span>
                        </div>
                        <span className="text-slate-300">|</span>
                        <div>
                          <span className="text-slate-400">Net Pay: </span>
                          <span className="font-bold text-emerald-700">{formatCurrency(run.total_net)}</span>
                        </div>
                      </div>

                      {/* Audit metadata */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                        <span>
                          Prepared by:{" "}
                          <strong className="text-slate-700">
                            {run.prepared_by_name || `Officer #${run.prepared_by}`}
                          </strong>
                          {selfPrepared && " (You)"}
                        </span>
                        {run.approved_by_name && (
                          <>
                            <span>•</span>
                            <span>
                              Approved by:{" "}
                              <strong className="text-slate-700">{run.approved_by_name}</strong>
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span>Created {format(new Date(run.created_at), "PPP")}</span>
                      </div>
                    </div>

                    {/* Actions and Skipped preview */}
                    <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                      {skippedCount > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRun(run)
                            setIsDetailsOpen(true)
                          }}
                          className="border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs h-9 px-3"
                        >
                          <AlertCircle className="mr-1.5 h-3.5 w-3.5 text-amber-600" />
                          {skippedCount} Skipped
                        </Button>
                      )}

                      {run.status === "draft" && (
                        <>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprove(run)}
                                    disabled={!canApprove || approveMutation.isPending}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 px-3.5 font-semibold shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                                    Approve Run
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              {selfPrepared && (
                                <TooltipContent>
                                  <p className="text-xs">
                                    A different person must approve the run (cannot approve own prepared run).
                                  </p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleOpenReject(run)}
                                    disabled={rejectMutation.isPending}
                                    className="border-rose-200 text-rose-700 hover:bg-rose-50 text-xs h-9 px-3"
                                  >
                                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                    Reject & Delete Draft
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">
                                  Rejecting deletes draft records so this month can be prepared again.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </>
                      )}

                      {run.status === "approved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRun(run)
                            setIsDetailsOpen(true)
                          }}
                          className="text-xs h-9 px-3"
                        >
                          <Eye className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prepare Payroll Run Dialog */}
      <Dialog open={isPrepareOpen} onOpenChange={setIsPrepareOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-600" />
              Prepare Monthly Payroll
            </DialogTitle>
            <DialogDescription>
              Prepare a month&apos;s payroll run for an MDA. Anyone without an active salary structure
              or already paid this month will be listed as skipped.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePrepareSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="mdaSelect" className="text-xs font-semibold text-slate-700">
                Target MDA <span className="text-rose-500">*</span>
              </Label>
              <Select value={targetCompanyId} onValueChange={setTargetCompanyId}>
                <SelectTrigger id="mdaSelect" className="h-10">
                  <SelectValue placeholder="Select MDA" />
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthSelect" className="text-xs font-semibold text-slate-700">
                  Payroll Month <span className="text-rose-500">*</span>
                </Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger id="monthSelect" className="h-10">
                    <SelectValue placeholder="Select Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearSelect" className="text-xs font-semibold text-slate-700">
                  Payroll Year <span className="text-rose-500">*</span>
                </Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger id="yearSelect" className="h-10">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Preparing generates draft payroll records. In compliance with internal controls, a
                different officer must approve the run before payslips are dispatched.
              </span>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPrepareOpen(false)}
                disabled={prepareMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={prepareMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {prepareMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparing...
                  </>
                ) : (
                  "Prepare Payroll"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details & Skipped Employees Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-emerald-600" />
              Payroll Run Details — {selectedRun?.company_name}
            </DialogTitle>
            <DialogDescription>
              {selectedRun && (
                <span>
                  {getMonthName(selectedRun.month)} {selectedRun.year} (Status: {selectedRun.status})
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedRun && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-3 gap-3 text-center bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">Total Staff</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedRun.total_employees}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Gross Amount</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {formatCurrency(selectedRun.total_gross)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Net Payout</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    {formatCurrency(selectedRun.total_net)}
                  </span>
                </div>
              </div>

              {/* Skipped employees list */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                  Skipped Employees ({selectedRun.skipped_employees?.length || 0})
                </h4>

                {(!selectedRun.skipped_employees || selectedRun.skipped_employees.length === 0) ? (
                  <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded border">
                    No employees were skipped in this run.
                  </p>
                ) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                    <div className="divide-y divide-slate-100">
                      {selectedRun.skipped_employees.map((sk: SkippedEmployee) => (
                        <div key={sk.employee_id} className="p-3 text-xs flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-slate-900">{sk.name}</span>
                            {sk.department && (
                              <span className="text-slate-500 ml-2">({sk.department})</span>
                            )}
                          </div>
                          <Badge variant="outline" className="border-amber-200 text-amber-800 bg-amber-50 text-[10px]">
                            {sk.reason}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject & Delete Draft Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <Trash2 className="h-5 w-5" />
              Reject & Delete Draft Payroll
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to reject the payroll run for{" "}
              <strong className="text-slate-900">{selectedRun?.company_name}</strong> (
              {selectedRun && getMonthName(selectedRun.month)} {selectedRun?.year})?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800">
              Rejecting a run permanently deletes its draft payroll records so that officers can adjust
              salary structures and prepare the month again.
            </div>

            <Label htmlFor="rejectPayrollReason" className="text-xs font-semibold text-slate-700">
              Reason for Rejection (Optional)
            </Label>
            <Textarea
              id="rejectPayrollReason"
              rows={3}
              placeholder="State reason for rejecting this payroll run..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRejectOpen(false)}
              disabled={rejectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRejectConfirm}
              disabled={rejectMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {rejectMutation.isPending ? "Deleting..." : "Reject & Delete Records"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
