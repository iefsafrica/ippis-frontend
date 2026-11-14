"use client"

import { useEffect, useState } from "react"
import type { AxiosError } from "axios"
import { Mail, Loader2, ShieldAlert, CheckCircle2, Info } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { useSendTerminationEmail } from "@/services/hooks/hr-core/useTerminations"
import type { Termination } from "@/types/hr-core/terminations"

interface SendTerminationEmailDialogProps {
  isOpen: boolean
  onClose: () => void
  termination: Termination | null
}

const TERMINATION_EMAIL_TYPES = [
  { value: "standard", label: "Standard Termination / Notice" },
  { value: "with_cause", label: "Termination with Cause / Disciplinary" },
  { value: "gross_misconduct", label: "Gross Misconduct / Summary Dismissal" },
  { value: "redundancy", label: "Redundancy / Structural Realignment" },
  { value: "non_confirmation", label: "Non-Confirmation of Probation" },
  { value: "contract_expiration", label: "Expiration of Fixed-Term Contract" },
  { value: "resignation", label: "Resignation" },
  { value: "retirement", label: "Retirement" },
  { value: "layoff", label: "Layoff" },
  { value: "dismissal", label: "Dismissal" },
  { value: "end_of_contract", label: "End of Contract" },
  { value: "mutual_agreement", label: "Mutual Agreement" },
]

const normalizeDateInput = (rawDate?: string): string => {
  if (!rawDate) return new Date().toISOString().split("T")[0]
  if (/^\d{4}-\d{2}-\d{2}/.test(rawDate)) return rawDate.slice(0, 10)
  const parsed = new Date(rawDate)
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().split("T")[0]
  return new Date().toISOString().split("T")[0]
}

export function SendTerminationEmailDialog({
  isOpen,
  onClose,
  termination,
}: SendTerminationEmailDialogProps) {
  const sendEmailMutation = useSendTerminationEmail()

  const [terminationType, setTerminationType] = useState("standard")
  const [terminationDate, setTerminationDate] = useState("")
  const [terminationReason, setTerminationReason] = useState("")
  const [noticePeriod, setNoticePeriod] = useState("1 Month")
  const [customRecipientEmail, setCustomRecipientEmail] = useState("")

  useEffect(() => {
    if (!isOpen || !termination) return
    setTerminationType(termination.termination_type || "standard")
    setTerminationDate(normalizeDateInput(termination.termination_date))
    setTerminationReason(termination.termination_reason || "")
    setNoticePeriod("1 Month")
    setCustomRecipientEmail("")
  }, [isOpen, termination])

  const isDisciplinary = ["with_cause", "disciplinary", "gross_misconduct", "dismissal"].includes(
    terminationType.toLowerCase()
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!termination?.employee_id) return

    try {
      const response = await sendEmailMutation.mutateAsync({
        employee_id: termination.employee_id,
        termination_type: terminationType,
        termination_date: terminationDate,
        termination_reason: terminationReason.trim(),
        notice_period: noticePeriod.trim() || undefined,
        custom_recipient_email: customRecipientEmail.trim() || undefined,
      })

      const recipient = response?.data?.recipient
      toast.success("Termination Email Dispatched", {
        description: recipient
          ? `Official disengagement notice sent to ${recipient}.`
          : response?.message || "Official termination notification email sent successfully.",
      })
      onClose()
    } catch (error) {
      const axiosErr = error as AxiosError<{ message?: string; error?: string }>
      const msg =
        axiosErr?.response?.data?.message ||
        axiosErr?.response?.data?.error ||
        (error instanceof Error ? error.message : "Failed to send termination email.")
      toast.error("Email Dispatch Failed", { description: msg })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#0B4628] border border-emerald-200">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Send Official Termination Email
              </DialogTitle>
              <DialogDescription className="text-slate-500 mt-0.5">
                Dispatch IPPIS HRMS disengagement notice for{" "}
                <span className="font-semibold text-slate-700">
                  {termination?.employee_name} ({termination?.employee_id})
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="send-email-type">Termination Type *</Label>
              <Select value={terminationType} onValueChange={setTerminationType}>
                <SelectTrigger id="send-email-type">
                  <SelectValue placeholder="Select termination type" />
                </SelectTrigger>
                <SelectContent>
                  {TERMINATION_EMAIL_TYPES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="send-email-date">Effective Termination Date *</Label>
              <Input
                id="send-email-date"
                type="date"
                value={terminationDate}
                onChange={(e) => setTerminationDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="send-email-notice">Notice Period</Label>
              <Input
                id="send-email-notice"
                value={noticePeriod}
                onChange={(e) => setNoticePeriod(e.target.value)}
                placeholder="e.g. 1 Month, 2 Weeks, Immediate"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="send-email-recipient">Custom Recipient Email (Optional)</Label>
              <Input
                id="send-email-recipient"
                type="email"
                value={customRecipientEmail}
                onChange={(e) => setCustomRecipientEmail(e.target.value)}
                placeholder="Leave blank to use employee email on file"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="send-email-reason">Termination Reason *</Label>
            <Textarea
              id="send-email-reason"
              rows={3}
              value={terminationReason}
              onChange={(e) => setTerminationReason(e.target.value)}
              placeholder="Enter official reason for disengagement"
              required
            />
          </div>

          {isDisciplinary ? (
            <div className="rounded-xl border border-red-200 bg-red-50/70 p-3.5 text-xs text-red-800 flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Disciplinary / Cause Alert Styling Enabled</p>
                <p className="mt-0.5 text-red-700">
                  The email will include disciplinary alert accents along with the mandatory Federal Exit Procedures Checklist.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Official IPPIS Exit Procedures Included</p>
                <ul className="mt-1 space-y-0.5 text-emerald-800">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 shrink-0" />
                    Government & Departmental Asset Surrender
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 shrink-0" />
                    Terminal Remuneration & Payroll Settlement Reconciliation
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 shrink-0" />
                    Pension & RSA Statement Clearance + Portal Deactivation
                  </li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={sendEmailMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={sendEmailMutation.isPending || !terminationReason.trim() || !terminationDate}
              className="bg-[#0B4628] hover:bg-[#093820] text-white"
            >
              {sendEmailMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Email...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Official Email
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

