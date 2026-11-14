"use client"

import { useState, useRef } from "react"
import Cookies from "js-cookie"
import { toast } from "sonner"
import { Upload, FileSpreadsheet, Download, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MdaSelect } from "@/components/mda-select"

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

interface DeductionsCsvUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeductionsCsvUploadDialog({
  open,
  onOpenChange,
  onSuccess,
}: DeductionsCsvUploadDialogProps) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1]

  const [month, setMonth] = useState<number>(now.getMonth() + 1)
  const [year, setYear] = useState<number>(currentYear)
  const [mdaId, setMdaId] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)
  const [previewRows, setPreviewRows] = useState<string[][]>([])
  const [uploading, setUploading] = useState(false)
  const [resultSummary, setResultSummary] = useState<{
    success: boolean
    message: string
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (selectedFile: File | null) => {
    setResultSummary(null)
    if (!selectedFile) {
      setFile(null)
      setPreviewRows([])
      return
    }

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please select a valid .csv file")
      return
    }

    setFile(selectedFile)
    try {
      const text = await selectedFile.text()
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 5)
        .map((line) => line.split(",").map((cell) => cell.replace(/^"|"$/g, "").trim()))
      setPreviewRows(lines)
    } catch {
      setPreviewRows([])
    }
  }

  const handleDownloadSample = async () => {
    const period = `${year}-${String(month).padStart(2, "0")}`
    try {
      const token =
        Cookies.get("token") ||
        Cookies.get("ippis_token") ||
        (typeof window !== "undefined"
          ? localStorage.getItem("token") || localStorage.getItem("ippis_token") || ""
          : "")
      const res = await fetch("/api/payroll/deductions/import?template=true&format=csv", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (res.ok) {
        const text = await res.text()
        const blob = new Blob([text], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `deductions-template-${period}.csv`
        link.click()
        URL.revokeObjectURL(url)
        return
      }
    } catch {}

    const csv = [
      "ippis_number,employee_id,period,income_tax,pension,nhis,loan_deduction,other_deductions",
      `EMP97133,EMP97133,${period},25000,12000,5000,15000,0`,
      `EMP54346,EMP54346,${period},18500,9500,4000,0,2500`,
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `deductions-template-${period}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please choose a CSV file to upload")
      return
    }

    setUploading(true)
    setResultSummary(null)

    try {
      const token =
        Cookies.get("token") ||
        Cookies.get("ippis_token") ||
        (typeof window !== "undefined"
          ? localStorage.getItem("token") || localStorage.getItem("ippis_token") || ""
          : "")

      const period = `${year}-${String(month).padStart(2, "0")}`
      const formData = new FormData()
      formData.append("file", file)
      formData.append("period", period)
      formData.append("month", String(month))
      formData.append("year", String(year))
      if (mdaId) {
        formData.append("mdaId", mdaId)
      }

      const res = await fetch("/api/payroll/deductions/import", {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json?.message || json?.error || "Failed to import deductions CSV")
      }

      const data = json?.data || json
      const importedCount =
        data?.importedCount ?? data?.imported ?? data?.updated ?? data?.count ?? undefined
      const msg =
        json?.message ||
        (importedCount !== undefined
          ? `Successfully imported ${importedCount} deduction record(s) for ${period}.`
          : `Deductions CSV uploaded successfully for ${period}.`)

      setResultSummary({ success: true, message: msg })
      toast.success(msg)
      onSuccess?.()
    } catch (err: any) {
      const msg = err?.message || "Failed to import deductions CSV"
      setResultSummary({ success: false, message: msg })
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Deductions CSV</DialogTitle>
          <DialogDescription>
            Bulk import employee deductions (PAYE tax, pension, NHIS, loans) for a pay period.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Month</Label>
              <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
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
            <div className="space-y-1.5">
              <Label>Year</Label>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
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

          <div className="space-y-1.5">
            <Label>MDA / Organization (Optional)</Label>
            <MdaSelect
              value={mdaId}
              onValueChange={(v) => setMdaId(v)}
              placeholder="All MDAs"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>CSV File</Label>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs text-[#0B4628]"
                onClick={handleDownloadSample}
              >
                <Download className="mr-1 h-3.5 w-3.5" />
                Download Sample CSV
              </Button>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center transition-colors hover:border-[#0B4628]/40 hover:bg-emerald-50/30"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => void handleFileChange(e.target.files?.[0] || null)}
              />
              {file ? (
                <div className="flex items-center gap-2 text-sm font-medium text-[#0B4628]">
                  <FileSpreadsheet className="h-5 w-5" />
                  <span>{file.name}</span>
                  <span className="text-xs text-slate-400">
                    ({Math.max(1, Math.round(file.size / 1024))} KB)
                  </span>
                </div>
              ) : (
                <>
                  <Upload className="mb-2 h-7 w-7 text-slate-400" />
                  <p className="text-sm font-medium text-slate-700">
                    Click to select a deductions `.csv` file
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Columns: ippis_number, employee_id, period, income_tax, pension, nhis, loan_deduction
                  </p>
                </>
              )}
            </div>
          </div>

          {previewRows.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 overflow-x-auto">
              <p className="text-[11px] font-semibold text-slate-600 mb-1.5">
                Preview (first {previewRows.length} rows)
              </p>
              <table className="w-full text-[11px] text-left">
                <tbody>
                  {previewRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={idx === 0 ? "font-semibold text-slate-800 border-b" : "text-slate-600"}
                    >
                      {row.slice(0, 6).map((cell, cIdx) => (
                        <td key={cIdx} className="py-1 pr-3 whitespace-nowrap">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {resultSummary && (
            <div
              className={`flex items-start gap-2 rounded-lg border p-3 text-xs ${
                resultSummary.success
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              {resultSummary.success ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              <span>{resultSummary.message}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!file || uploading}
            className="bg-[#0B4628] hover:bg-[#08351E] text-white"
          >
            {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload & Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

