"use client"

import { useMemo, useRef, useState } from "react"
import { format } from "date-fns"
import { toast } from "sonner"
import {
  CalendarIcon,
  Download,
  FileText,
  Loader2,
  Printer,
  RefreshCw,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnhancedDataTable } from "@/app/admin/components/enhanced-data-table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { MdaSelect } from "@/components/mda-select"
import { cn } from "@/lib/utils"
import { downloadPayslipPdf } from "../payroll-payslip/payslip-pdf"
import { DeductionsCsvUploadDialog } from "../components/deductions-csv-upload-dialog"
import { useGetDepartments } from "@/services/hooks/organizations/department/useDepartment"
import { useEmployeesList } from "@/services/hooks/employees/useEmployees"
import {
  useGeneratePayslips,
  usePayslipDetails,
  usePayslips,
} from "@/services/hooks/payroll/usePayslips"
import type {
  PayslipDetailLineItem,
  PayslipRecord,
} from "@/services/endpoints/payroll/payslips"

function formatCurrency(value: unknown) {
  const num = Number(value ?? 0)
  if (Number.isNaN(num)) return "₦0.00"
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(num)
}

function formatSafeDate(value?: string | null, fallback = "N/A") {
  if (!value) return fallback
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return format(d, "PPP")
}

function normalizeLineItems(
  items?: PayslipDetailLineItem[] | Record<string, number> | null
): Array<{ label: string; amount: number }> {
  if (!items) return []
  if (Array.isArray(items)) {
    return items.map((item) => ({
      label: item.label || item.type || item.name || item.code || "Item",
      amount: Number(item.amount ?? 0),
    }))
  }
  if (typeof items === "object") {
    return Object.entries(items).map(([key, val]) => ({
      label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      amount: Number(val ?? 0),
    }))
  }
  return []
}

const MONTH_OPTIONS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
]

export function PayslipContent() {
  const now = new Date()
  const currentYear = now.getFullYear()
  const yearOptions = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1]

  const [selectedTab, setSelectedTab] = useState("generate")
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(now)
  const [selectedMdaId, setSelectedMdaId] = useState<string>("all")
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("all")
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("all")
  const [showPayslipPreview, setShowPayslipPreview] = useState(false)
  const [selectedPayslipId, setSelectedPayslipId] = useState<string | null>(null)
  const [showGenerateConfirmation, setShowGenerateConfirmation] = useState(false)
  const [showDeductionsUpload, setShowDeductionsUpload] = useState(false)
  const [dryRunResult, setDryRunResult] = useState<any>(null)
  const payslipPreviewRef = useRef<HTMLDivElement>(null)

  const { data: departmentsRes } = useGetDepartments()
  const departments = useMemo(() => {
    const raw = (departmentsRes as any)?.data?.departments || (departmentsRes as any)?.data || []
    return Array.isArray(raw) ? raw : []
  }, [departmentsRes])

  const { data: employeesRes } = useEmployeesList(1)
  const filteredEmployees = useMemo(() => {
    const list = employeesRes?.employees || []
    return list.filter((emp: any) => {
      if (selectedMdaId && selectedMdaId !== "all") {
        const empMda = String(
          emp.company_id ?? emp.mda_id ?? emp.metadata?.company_id ?? emp.metadata?.mda_id ?? ""
        )
        if (empMda && empMda !== String(selectedMdaId)) return false
      }
      if (selectedDepartmentId && selectedDepartmentId !== "all") {
        const empDeptId = String(emp.department_id ?? emp.metadata?.department_id ?? "")
        const deptObj = departments.find((d: any) => String(d.id) === String(selectedDepartmentId))
        const deptName = String(deptObj?.name || "").toLowerCase()
        const empDeptName = String(emp.department || "").toLowerCase()
        if (empDeptId) {
          if (empDeptId !== String(selectedDepartmentId)) return false
        } else if (deptName && empDeptName && empDeptName !== deptName) {
          return false
        }
      }
      return true
    })
  }, [employeesRes?.employees, selectedMdaId, selectedDepartmentId, departments])

  const selectedPeriodLabel = `${
    MONTH_OPTIONS.find((m) => m.value === selectedMonth)?.label || selectedMonth
  } ${selectedYear}`

  const {
    data: payslipsRes,
    isLoading: payslipsLoading,
    refetch: refetchPayslips,
  } = usePayslips({ limit: 100 })

  const payslips: PayslipRecord[] = useMemo(() => {
    const raw =
      (payslipsRes as any)?.data?.payslips ||
      (payslipsRes as any)?.payslips ||
      (payslipsRes as any)?.data ||
      []
    if (!Array.isArray(raw)) return []
    return raw.map((item: any) => ({
      ...item,
      id: item.reference || item.payment_id || item.payslip_number || item.id,
      rawId: item.id,
      employeeName:
        item.employeeName ||
        item.employee_name ||
        item.employee?.full_name ||
        item.employee?.name ||
        "Employee",
      department:
        item.department ||
        item.department_name ||
        item.employee?.department ||
        "General",
      month:
        item.period ||
        (item.month && item.year ? `${item.month}/${item.year}` : item.month) ||
        "N/A",
      generatedDate:
        item.payment_date ||
        item.generated_date ||
        item.created_at ||
        new Date().toISOString(),
      net_pay: Number(item.net_pay ?? item.netPay ?? 0),
      gross_pay: Number(item.gross_pay ?? item.total_earnings ?? 0),
      status: item.status || "Generated",
    }))
  }, [payslipsRes])

  const { data: detailData, isLoading: detailLoading } = usePayslipDetails(
    selectedPayslipId,
    showPayslipPreview
  )

  const generateMutation = useGeneratePayslips()

  const buildGeneratePayload = (dryRun: boolean) => {
    const period = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`

    return {
      month: selectedMonth,
      year: selectedYear,
      period,
      ...(selectedMdaId && selectedMdaId !== "all" ? { mdaId: selectedMdaId } : {}),
      ...(selectedDepartmentId && selectedDepartmentId !== "all"
        ? { departmentId: selectedDepartmentId }
        : {}),
      ...(selectedEmployeeId && selectedEmployeeId !== "all"
        ? { employeeId: selectedEmployeeId }
        : {}),
      ...(paymentDate ? { paymentDate: format(paymentDate, "yyyy-MM-dd") } : {}),
      dryRun,
    }
  }

  const handleOpenGenerateModal = async () => {
    setDryRunResult(null)
    setShowGenerateConfirmation(true)
    try {
      const preview = await generateMutation.mutateAsync(buildGeneratePayload(true))
      setDryRunResult(preview?.data || preview)
    } catch {
      // Non-blocking: user can still inspect or trigger generation
    }
  }

  const handleGeneratePayslips = async () => {
    try {
      const res = await generateMutation.mutateAsync(buildGeneratePayload(false))
      const summary = res?.data || res || {}
      const generatedCount =
        summary.generatedCount ?? summary.generated ?? summary.created ?? summary.count ?? 0
      const skippedCount = summary.skippedCount ?? summary.skipped?.length ?? 0

      toast.success(
        res?.message ||
          `Payslips generated (${generatedCount} created${
            skippedCount ? `, ${skippedCount} skipped` : ""
          }).`
      )
      setShowGenerateConfirmation(false)
      setDryRunResult(null)
      await refetchPayslips()
      setSelectedTab("history")
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate payslips")
    }
  }

  const handleViewPayslip = (id: string) => {
    setSelectedPayslipId(String(id))
    setShowPayslipPreview(true)
  }

  const normalizedDetail = useMemo(() => {
    const d: any = detailData || {}
    const emp = d.employee || {}
    const bank = d.banking || {}
    const summary = d.summary || {}
    const earnings = normalizeLineItems(d.earnings)
    const deductions = normalizeLineItems(d.deductions)

    const totalEarnings = Number(
      summary.gross_pay ??
        summary.total_earnings ??
        d.gross_pay ??
        earnings.reduce((sum, item) => sum + item.amount, 0)
    )
    const totalDeductions = Number(
      summary.total_deductions ??
        d.total_deductions ??
        deductions.reduce((sum, item) => sum + item.amount, 0)
    )
    const netPay = Number(
      summary.net_pay ?? d.net_pay ?? Math.max(0, totalEarnings - totalDeductions)
    )

    return {
      id: d.reference || d.payment_id || d.id || selectedPayslipId || "N/A",
      employeeId: emp.ippis_number || emp.id || d.ippis_number || d.employee_id || "N/A",
      legacyId: emp.legacy_id || d.legacy_id,
      employeeName: emp.full_name || emp.name || d.employee_name || "Employee",
      mda: emp.mda || d.mda || "N/A",
      department: emp.department || d.department || "N/A",
      position: emp.position || emp.cadre || d.position || "Civil Officer",
      gradeStep:
        emp.grade_level || emp.step
          ? `${emp.grade_level || "-"} / Step ${emp.step || "-"}`
          : undefined,
      salaryStructure: emp.salary_structure,
      location: emp.location,
      taxState: emp.tax_state,
      period: d.period || (d.month && d.year ? `${d.month}/${d.year}` : "N/A"),
      generatedDate: d.payment_date || d.generated_date || d.created_at || new Date().toISOString(),
      bankName: bank.bank_name || d.bank_name || "N/A",
      accountNumber: bank.account_number || d.account_number || "N/A",
      pfa: bank.pfa,
      rsaPin: bank.rsa_pin,
      paymentMethod: bank.payment_method || "Bank Transfer",
      earnings,
      deductions,
      totalEarnings,
      totalDeductions,
      netPay,
      ytdPaid: summary.ytd_paid,
      ytdTax: summary.ytd_tax,
      ytdPension: summary.ytd_pension,
    }
  }, [detailData, selectedPayslipId])

  const handleDownloadPayslipPdf = () => {
    if (typeof window === "undefined") return
    const payload = {
      payment_id: String(normalizedDetail.id),
      employee_id: String(normalizedDetail.employeeId),
      employee_name: normalizedDetail.employeeName,
      department: normalizedDetail.department,
      position: normalizedDetail.position,
      month: String(normalizedDetail.period),
      created_at: normalizedDetail.generatedDate,
      payment_date: normalizedDetail.generatedDate,
      amount: normalizedDetail.totalEarnings,
      deduction_amount: normalizedDetail.totalDeductions,
      bank_name: normalizedDetail.bankName,
      account: normalizedDetail.accountNumber,
    }
    void downloadPayslipPdf(payload, payslipPreviewRef.current)
  }

  const handleDownloadPayslipCsv = () => {
    if (typeof window === "undefined") return
    const rows = [
      ["Section", "Description", "Amount"],
      ...normalizedDetail.earnings.map((e) => ["Earning", e.label, String(e.amount)]),
      ...normalizedDetail.deductions.map((d) => ["Deduction", d.label, String(d.amount)]),
      ["Summary", "Gross Pay", String(normalizedDetail.totalEarnings)],
      ["Summary", "Total Deductions", String(normalizedDetail.totalDeductions)],
      ["Summary", "Net Pay", String(normalizedDetail.netPay)],
    ]
    const csv = rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `payslip-${normalizedDetail.id}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handlePrintPayslip = () => {
    if (typeof window !== "undefined") {
      window.print()
    }
  }

  const payslipColumns = [
    { key: "id", label: "Payslip ID", sortable: true },
    { key: "employeeName", label: "Employee", sortable: true },
    { key: "department", label: "Department", sortable: true },
    { key: "month", label: "Period", sortable: true },
    {
      key: "net_pay",
      label: "Net Pay",
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold text-slate-900">{formatCurrency(value)}</span>
      ),
    },
    {
      key: "generatedDate",
      label: "Payment Date",
      sortable: true,
      render: (value: string) => formatSafeDate(value),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => {
        const lower = String(value || "").toLowerCase()
        const isSuccess = lower === "paid" || lower === "generated" || lower === "approved"
        return (
          <Badge
            className={
              isSuccess
                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                : "bg-amber-100 text-amber-800 hover:bg-amber-100"
            }
          >
            {value || "Generated"}
          </Badge>
        )
      },
    },
  ]

  const filterOptions = [
    {
      id: "department",
      label: "Department",
      type: "select" as const,
      options: departments.map((dept: any) => ({
        value: dept.name || String(dept.id),
        label: dept.name || `Department #${dept.id}`,
      })),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payslip Management</h2>
          <p className="text-muted-foreground">Generate and manage employee payslips</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeductionsUpload(true)}
            className="rounded-full bg-white"
          >
            <Upload className="mr-2 h-3.5 w-3.5" />
            Upload Deductions CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchPayslips()}
            disabled={payslipsLoading}
            className="rounded-full bg-white"
          >
            <RefreshCw className={cn("mr-2 h-3.5 w-3.5", payslipsLoading && "animate-spin")} />
            Refresh History
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate Payslips</TabsTrigger>
          <TabsTrigger value="history">Payslip History ({payslips.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <Card className="rounded-2xl border-slate-200/70 shadow-2xs">
            <CardHeader>
              <CardTitle>Generate Payslips</CardTitle>
              <CardDescription>
                Generate payslips for eligible employees based on their active status, MDA/department scope, and payment records.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="pay-month">Month</Label>
                    <Select
                      value={String(selectedMonth)}
                      onValueChange={(val) => setSelectedMonth(Number(val))}
                    >
                      <SelectTrigger id="pay-month">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTH_OPTIONS.map((m) => (
                          <SelectItem key={m.value} value={String(m.value)}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pay-year">Year</Label>
                    <Select
                      value={String(selectedYear)}
                      onValueChange={(val) => setSelectedYear(Number(val))}
                    >
                      <SelectTrigger id="pay-year">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {yearOptions.map((y) => (
                          <SelectItem key={y} value={String(y)}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-date">Payment Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="payment-date"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !paymentDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {paymentDate ? format(paymentDate, "PPP") : <span>Select payment date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={paymentDate} onSelect={setPaymentDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>MDA / Organization (Optional)</Label>
                  <MdaSelect
                    value={selectedMdaId === "all" ? "" : selectedMdaId}
                    onValueChange={(val) => {
                      setSelectedMdaId(val || "all")
                      setSelectedEmployeeId("all")
                    }}
                    placeholder="All MDAs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department (Optional)</Label>
                  <Select
                    value={selectedDepartmentId}
                    onValueChange={(val) => {
                      setSelectedDepartmentId(val)
                      setSelectedEmployeeId("all")
                    }}
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept: any) => (
                        <SelectItem key={dept.id} value={String(dept.id)}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="employee">Employee (Optional — leave as All for batch generation)</Label>
                  <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                    <SelectTrigger id="employee">
                      <SelectValue placeholder="All Eligible Employees" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        All Eligible Employees ({filteredEmployees.length})
                      </SelectItem>
                      {filteredEmployees.map((emp: any) => (
                        <SelectItem key={emp.id} value={String(emp.id)}>
                          {emp.name} {emp.registration_id ? `(${emp.registration_id})` : `(${emp.id})`}
                          {emp.department ? ` — ${emp.department}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleOpenGenerateModal}
                  disabled={generateMutation.isPending}
                  className="bg-[#0B4628] hover:bg-[#08351E] text-white"
                >
                  {generateMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Generate Payslips
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <EnhancedDataTable
            title="Payslip Records"
            columns={payslipColumns}
            data={payslips}
            isLoading={payslipsLoading}
            onAdd={() => setSelectedTab("generate")}
            onView={handleViewPayslip}
            filterOptions={filterOptions}
          />
        </TabsContent>
      </Tabs>

      {/* Generate Confirmation Dialog (with Live Dry-Run Preview) */}
      <Dialog open={showGenerateConfirmation} onOpenChange={setShowGenerateConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Payslip Generation</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-slate-700">
              Generate payslips for{" "}
              <span className="font-semibold">{selectedPeriodLabel}</span>
              {selectedEmployeeId !== "all" ? " (selected employee)" : ""}?
            </p>

            {generateMutation.isPending && !dryRunResult ? (
              <div className="flex items-center gap-2 text-xs text-slate-500 rounded-lg bg-slate-50 p-3">
                <Loader2 className="h-4 w-4 animate-spin text-[#0B4628]" />
                Checking eligible employees and duplicate safeguards...
              </div>
            ) : dryRunResult ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs space-y-1">
                <p className="font-semibold text-[#0B4628]">Dry-Run Eligibility Preview</p>
                <p className="text-slate-700">
                  Eligible employees:{" "}
                  <span className="font-bold">
                    {dryRunResult.eligibleCount ?? dryRunResult.eligible ?? 0}
                  </span>
                  {" • "}
                  Skipped:{" "}
                  <span className="font-bold">
                    {dryRunResult.skippedCount ?? dryRunResult.skipped?.length ?? 0}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                This calculates allowances and statutory deductions (PAYE, pension, NHIS, loans) and prevents duplicate payments for the same period.
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowGenerateConfirmation(false)}
              disabled={generateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGeneratePayslips}
              disabled={generateMutation.isPending}
              className="bg-[#0B4628] hover:bg-[#08351E] text-white"
            >
              {generateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirm & Generate
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payslip Preview Dialog */}
      <Dialog open={showPayslipPreview} onOpenChange={setShowPayslipPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Payslip Preview</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {detailLoading ? (
              <div className="space-y-4 p-6 border rounded-lg">
                <Skeleton className="h-8 w-64" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
                <Skeleton className="h-40 w-full" />
              </div>
            ) : (
              <div ref={payslipPreviewRef} className="border rounded-xl p-6 bg-white">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-6 border-b pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#0B4628]">IPPIS Payroll System</h3>
                    <p className="text-sm text-gray-500">Federal Government of Nigeria</p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-lg font-semibold">Official Payslip</h4>
                    <p className="text-sm font-mono">Ref: {normalizedDetail.id}</p>
                    <p className="text-sm text-gray-600">
                      Date: {formatSafeDate(normalizedDetail.generatedDate)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-1 text-sm">
                    <h5 className="font-semibold text-slate-900 mb-2">Employee Details</h5>
                    <p><span className="text-slate-500">IPPIS / ID:</span> {normalizedDetail.employeeId}</p>
                    {normalizedDetail.legacyId && (
                      <p><span className="text-slate-500">Legacy ID:</span> {normalizedDetail.legacyId}</p>
                    )}
                    <p><span className="text-slate-500">Name:</span> {normalizedDetail.employeeName}</p>
                    <p><span className="text-slate-500">MDA:</span> {normalizedDetail.mda}</p>
                    <p><span className="text-slate-500">Department:</span> {normalizedDetail.department}</p>
                    <p><span className="text-slate-500">Position / Cadre:</span> {normalizedDetail.position}</p>
                    {normalizedDetail.gradeStep && (
                      <p><span className="text-slate-500">Grade / Step:</span> {normalizedDetail.gradeStep}</p>
                    )}
                    {normalizedDetail.salaryStructure && (
                      <p><span className="text-slate-500">Structure:</span> {normalizedDetail.salaryStructure}</p>
                    )}
                    {(normalizedDetail.location || normalizedDetail.taxState) && (
                      <p>
                        <span className="text-slate-500">Location / Tax State:</span>{" "}
                        {[normalizedDetail.location, normalizedDetail.taxState].filter(Boolean).join(" • ")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 text-sm">
                    <h5 className="font-semibold text-slate-900 mb-2">Payment & Banking Details</h5>
                    <p><span className="text-slate-500">Pay Period:</span> {normalizedDetail.period}</p>
                    <p><span className="text-slate-500">Payment Method:</span> {normalizedDetail.paymentMethod}</p>
                    <p><span className="text-slate-500">Bank:</span> {normalizedDetail.bankName}</p>
                    <p><span className="text-slate-500">Account Number:</span> {normalizedDetail.accountNumber}</p>
                    {normalizedDetail.pfa && (
                      <p><span className="text-slate-500">PFA:</span> {normalizedDetail.pfa}</p>
                    )}
                    {normalizedDetail.rsaPin && (
                      <p><span className="text-slate-500">RSA PIN:</span> {normalizedDetail.rsaPin}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h5 className="font-semibold mb-2">Earnings</h5>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {normalizedDetail.earnings.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-xs text-slate-400">
                              No itemized earnings returned
                            </TableCell>
                          </TableRow>
                        ) : (
                          normalizedDetail.earnings.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.label}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                            </TableRow>
                          ))
                        )}
                        <TableRow>
                          <TableCell className="font-semibold">Gross Earnings</TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(normalizedDetail.totalEarnings)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  <div>
                    <h5 className="font-semibold mb-2">Deductions</h5>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {normalizedDetail.deductions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-xs text-slate-400">
                              No itemized deductions returned
                            </TableCell>
                          </TableRow>
                        ) : (
                          normalizedDetail.deductions.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.label}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                            </TableRow>
                          ))
                        )}
                        <TableRow>
                          <TableCell className="font-semibold">Total Deductions</TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(normalizedDetail.totalDeductions)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <h5 className="text-lg font-bold">Net Pay</h5>
                    <p className="text-lg font-bold text-[#0B4628]">
                      {formatCurrency(normalizedDetail.netPay)}
                    </p>
                  </div>
                  {(normalizedDetail.ytdPaid !== undefined ||
                    normalizedDetail.ytdTax !== undefined ||
                    normalizedDetail.ytdPension !== undefined) && (
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
                      {normalizedDetail.ytdPaid !== undefined && (
                        <span>YTD Paid: {formatCurrency(normalizedDetail.ytdPaid)}</span>
                      )}
                      {normalizedDetail.ytdTax !== undefined && (
                        <span>YTD Tax: {formatCurrency(normalizedDetail.ytdTax)}</span>
                      )}
                      {normalizedDetail.ytdPension !== undefined && (
                        <span>YTD Pension: {formatCurrency(normalizedDetail.ytdPension)}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-8 text-center text-xs text-gray-500">
                  <p>This is a computer-generated document and does not require a physical signature.</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" className="gap-1" onClick={handlePrintPayslip} disabled={detailLoading}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" className="gap-1" onClick={handleDownloadPayslipPdf} disabled={detailLoading}>
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" className="gap-1" onClick={handleDownloadPayslipCsv} disabled={detailLoading}>
              <FileText className="h-4 w-4" />
              Download CSV
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeductionsCsvUploadDialog
        open={showDeductionsUpload}
        onOpenChange={setShowDeductionsUpload}
        onSuccess={() => refetchPayslips()}
      />
    </div>
  )
}
