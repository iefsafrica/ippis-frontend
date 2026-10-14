"use client"

import React, { useState } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { validateAndImportUsersCsv } from "@/services/endpoints/users/user-management"
import type { UserImportResult, UserImportRow } from "@/types/user-management"
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileUp,
  Loader2,
  Upload,
} from "lucide-react"

interface BulkImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function BulkImportDialog({ open, onOpenChange, onSuccess }: BulkImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [csvContent, setCsvContent] = useState<string>("")
  const [validationResult, setValidationResult] = useState<UserImportResult | null>(null)
  const [validating, setValidating] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importReason, setImportReason] = useState("Bulk user onboard per civil service cohort 2026")

  const downloadSampleTemplate = () => {
    const headers = [
      "Username",
      "Email",
      "FullName",
      "StaffID",
      "Phone",
      "Role",
      "MDA",
      "Department",
      "ScopeLevel",
    ]
    const sampleRows = [
      [
        "suleiman.dada",
        "s.dada@fmf.gov.ng",
        "Suleiman Dada",
        "FMF-PAY-209",
        "+2348039988771",
        "Payroll Officer",
        "Federal Ministry of Finance",
        "Revenue & Tax Policy",
        "assigned_mda",
      ],
      [
        "ngozi.eze",
        "n.eze@oagf.gov.ng",
        "Ngozi Eze",
        "OAGF-AUD-118",
        "+2348021122334",
        "Auditor",
        "Office of the Accountant General of the Federation",
        "IPPIS Central Operations",
        "all_mdas",
      ],
      [
        "haruna.garba",
        "h.garba@fmoh.gov.ng",
        "Haruna Garba",
        "FMOH-HR-034",
        "+2348145566778",
        "HR Manager",
        "Federal Ministry of Health",
        "Hospital Services",
        "department",
      ],
    ]

    const csvStr = [headers.join(","), ...sampleRows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "ippis_user_import_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Template Downloaded", {
      description: "Validated template ippis_user_import_template.csv saved.",
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      setFile(selected)
      setValidationResult(null)

      try {
        setValidating(true)
        const text = await selected.text()
        setCsvContent(text)

        // USR03: Validate required identifiers, duplicates, and organisational assignments
        const result = await validateAndImportUsersCsv(text, { dryRun: true })
        setValidationResult(result)

        if (result.invalid === 0) {
          toast.success("Validation Passed", {
            description: `All ${result.valid} user records passed structural and duplicate validations.`,
          })
        } else {
          toast.warning("Validation Issues Found", {
            description: `${result.invalid} row(s) have errors (missing required fields, duplicate emails/usernames/staff IDs).`,
          })
        }
      } catch (err: any) {
        toast.error("File Validation Error", {
          description: err.message || "Failed to process CSV file",
        })
        setValidationResult(null)
      } finally {
        setValidating(false)
      }
    }
  }

  const handleExecuteImport = async () => {
    if (!csvContent || !validationResult) return

    if (validationResult.valid === 0) {
      toast.error("Cannot Import", { description: "There are no valid records to import." })
      return
    }

    try {
      setImporting(true)
      const res = await validateAndImportUsersCsv(csvContent, {
        dryRun: false,
        reason: importReason,
      })

      toast.success("Import Completed", {
        description: `Successfully provisioned ${res.imported} user accounts into the system.`,
      })
      onSuccess()
      onOpenChange(false)
      setFile(null)
      setValidationResult(null)
    } catch (err: any) {
      toast.error("Import Execution Failed", {
        description: err.message || "Failed to complete bulk import",
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Bulk User Account Import</DialogTitle>
                <DialogDescription>
                  Upload validated CSV template to provision multiple user accounts with automated identifier & duplicate checking (USR02, USR03).
                </DialogDescription>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={downloadSampleTemplate}
              className="flex items-center gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              <Download className="h-3.5 w-3.5" />
              Download Validated Template
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors bg-gray-50/50">
            <input
              type="file"
              id="user-csv-file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="user-csv-file" className="cursor-pointer space-y-2 block">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <FileUp className="h-6 w-6" />
              </div>
              <div className="text-sm font-semibold text-gray-800">
                {file ? file.name : "Click to select or drag & drop CSV file"}
              </div>
              <p className="text-xs text-gray-500">
                Columns checked: Username, Email, FullName, StaffID, Phone, Role, MDA, Department, ScopeLevel
              </p>
            </label>
          </div>

          {validating && (
            <div className="flex items-center justify-center p-8 gap-2 text-sm text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
              Validating required identifiers, duplicate accounts and assignments (USR03)...
            </div>
          )}

          {/* Validation Feedback Overview */}
          {validationResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 rounded-lg border bg-gray-50 text-center">
                  <div className="text-xs text-gray-500 font-medium">Total Rows</div>
                  <div className="text-lg font-bold text-gray-900">{validationResult.total}</div>
                </div>
                <div className="p-3 rounded-lg border bg-emerald-50 border-emerald-200 text-center">
                  <div className="text-xs text-emerald-700 font-medium">Valid Records</div>
                  <div className="text-lg font-bold text-emerald-700">{validationResult.valid}</div>
                </div>
                <div className="p-3 rounded-lg border bg-red-50 border-red-200 text-center">
                  <div className="text-xs text-red-700 font-medium">Validation Errors</div>
                  <div className="text-lg font-bold text-red-700">{validationResult.invalid}</div>
                </div>
                <div className="p-3 rounded-lg border bg-blue-50 border-blue-200 text-center">
                  <div className="text-xs text-blue-700 font-medium">Ready to Import</div>
                  <div className="text-lg font-bold text-blue-700">{validationResult.valid}</div>
                </div>
              </div>

              {/* Table Preview */}
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 flex items-center justify-between">
                  <span>Parsed Record Validation Matrix (USR03)</span>
                  <span className="text-gray-500">{validationResult.records.length} records parsed</span>
                </div>
                <ScrollArea className="h-64">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b text-gray-600 sticky top-0">
                      <tr>
                        <th className="p-2 text-left">Row</th>
                        <th className="p-2 text-left">Status</th>
                        <th className="p-2 text-left">Full Name</th>
                        <th className="p-2 text-left">Staff ID</th>
                        <th className="p-2 text-left">Username / Email</th>
                        <th className="p-2 text-left">Role & Scope</th>
                        <th className="p-2 text-left">Validation Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {validationResult.records.map((r) => (
                        <tr
                          key={r.row_number}
                          className={r.valid ? "hover:bg-gray-50/50" : "bg-red-50/40 hover:bg-red-50/70"}
                        >
                          <td className="p-2 font-mono text-gray-500">#{r.row_number}</td>
                          <td className="p-2">
                            {r.valid ? (
                              <Badge className="bg-emerald-100 text-emerald-800 border-none font-medium text-[10px]">
                                <CheckCircle2 className="h-3 w-3 mr-1 inline" /> Valid
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800 border-none font-medium text-[10px]">
                                <AlertCircle className="h-3 w-3 mr-1 inline" /> Error
                              </Badge>
                            )}
                          </td>
                          <td className="p-2 font-medium text-gray-900">{r.full_name || "—"}</td>
                          <td className="p-2 font-mono text-gray-700">{r.staff_id || "—"}</td>
                          <td className="p-2">
                            <div className="font-mono text-gray-800">{r.username}</div>
                            <div className="text-[11px] text-gray-500">{r.email}</div>
                          </td>
                          <td className="p-2">
                            <div className="font-medium text-gray-800">{r.role_names}</div>
                            <div className="text-[11px] text-gray-500">{r.mda_name}</div>
                          </td>
                          <td className="p-2">
                            {r.errors.length > 0 && (
                              <div className="text-red-600 font-medium space-y-0.5">
                                {r.errors.map((err, idx) => (
                                  <div key={idx} className="flex items-center gap-1">
                                    &bull; {err}
                                  </div>
                                ))}
                              </div>
                            )}
                            {r.warnings.length > 0 && (
                              <div className="text-amber-600 text-[11px]">
                                {r.warnings.map((warn, idx) => (
                                  <div key={idx}>&bull; {warn}</div>
                                ))}
                              </div>
                            )}
                            {r.errors.length === 0 && r.warnings.length === 0 && (
                              <span className="text-emerald-600 text-[11px]">Ready for provisioning</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </div>

              {/* Reason for Audit */}
              <div className="space-y-1.5 pt-2">
                <Label htmlFor="import_reason" className="text-xs font-semibold text-gray-700">
                  Import Audit Authorization Reason (USR09) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="import_reason"
                  value={importReason}
                  onChange={(e) => setImportReason(e.target.value)}
                  placeholder="e.g. Approved Batch Onboarding per Circular OHCSF/2026/08"
                  className="text-xs"
                  required
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={importing}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[#008751] hover:bg-[#008751]/90 text-white"
            onClick={handleExecuteImport}
            disabled={!validationResult || validationResult.valid === 0 || importing}
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Provisioning Accounts...
              </>
            ) : (
              `Import ${validationResult?.valid || 0} Valid Accounts`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
