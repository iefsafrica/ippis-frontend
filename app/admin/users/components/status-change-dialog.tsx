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
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { changeUserStatus } from "@/services/endpoints/users/user-management"
import type { UserAccount, UserStatus } from "@/types/user-management"
import { AlertTriangle, CheckCircle, ShieldAlert, UserX, UserCheck } from "lucide-react"

interface StatusChangeDialogProps {
  user: UserAccount | null
  targetStatus: UserStatus | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (updated: UserAccount) => void
}

export function StatusChangeDialog({
  user,
  targetStatus,
  open,
  onOpenChange,
  onSuccess,
}: StatusChangeDialogProps) {
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState("")
  const [suspensionDays, setSuspensionDays] = useState("14")

  if (!user || !targetStatus) return null

  const getActionDetails = () => {
    switch (targetStatus) {
      case "active":
        return {
          title: user.status === "suspended" ? "Reactivate Suspended Account" : "Activate Account",
          icon: <UserCheck className="h-5 w-5 text-emerald-600" />,
          bannerClass: "bg-emerald-50 border-emerald-200 text-emerald-900",
          buttonClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
          description: `Restore full system and module access for ${user.full_name} (${user.staff_id}).`,
        }
      case "suspended":
        return {
          title: "Suspend User Account",
          icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
          bannerClass: "bg-amber-50 border-amber-200 text-amber-900",
          buttonClass: "bg-amber-600 hover:bg-amber-700 text-white",
          description: `Temporarily revoke login sessions and system authorization for ${user.full_name}.`,
        }
      case "deactivated":
        return {
          title: "Deactivate User Account",
          icon: <UserX className="h-5 w-5 text-red-600" />,
          bannerClass: "bg-red-50 border-red-200 text-red-900",
          buttonClass: "bg-red-600 hover:bg-red-700 text-white",
          description: `Permanently deactivate credentials and revoke permissions for ${user.full_name}.`,
        }
      default:
        return {
          title: "Update Account Status",
          icon: <ShieldAlert className="h-5 w-5 text-gray-600" />,
          bannerClass: "bg-gray-50 border-gray-200 text-gray-900",
          buttonClass: "bg-gray-800 hover:bg-gray-900 text-white",
          description: `Change account status for ${user.full_name}.`,
        }
    }
  }

  const details = getActionDetails()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason.trim()) {
      toast.error("Justification Required", {
        description: "USR09 requires a documented reason for altering account status.",
      })
      return
    }

    try {
      setLoading(true)
      const updated = await changeUserStatus({
        user_id: user.id,
        status: targetStatus,
        reason,
        suspension_days: targetStatus === "suspended" ? Number(suspensionDays) : undefined,
      })

      toast.success("Status Updated", {
        description: `Account status for ${updated.full_name} changed to ${targetStatus.toUpperCase()}. Audit entry logged.`,
      })
      onSuccess(updated)
      onOpenChange(false)
      setReason("")
    } catch (err: any) {
      toast.error("Status Update Failed", {
        description: err.message || "Failed to update user status",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gray-100 rounded-lg">{details.icon}</div>
            <div>
              <DialogTitle className="text-lg font-bold">{details.title}</DialogTitle>
              <DialogDescription>{details.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className={`p-3.5 rounded-xl border text-xs space-y-1 ${details.bannerClass}`}>
            <div className="font-semibold flex items-center justify-between">
              <span>Current Status: <span className="uppercase font-bold">{user.status}</span></span>
              <span>Target: <span className="uppercase font-bold">{targetStatus}</span></span>
            </div>
            <p className="opacity-90">
              User: <span className="font-medium">{user.full_name}</span> ({user.email}) &bull; MDA: {user.mda_name || "N/A"}
            </p>
          </div>

          {targetStatus === "suspended" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Suspension Duration (USR06 Controls)</Label>
              <Select value={suspensionDays} onValueChange={setSuspensionDays}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days (Review Period)</SelectItem>
                  <SelectItem value="14">14 Days (Standard Disciplinary)</SelectItem>
                  <SelectItem value="30">30 Days (Extended Inquiry)</SelectItem>
                  <SelectItem value="90">90 Days (Formal Panel Review)</SelectItem>
                  <SelectItem value="0">Indefinite (Until Manual Reactivation)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="status_reason" className="text-xs font-semibold text-gray-700">
              Mandatory Justification / Reference (USR09) <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="status_reason"
              placeholder={`Provide the administrative reason or disciplinary query reference for this ${targetStatus} action...`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[85px] text-xs"
              required
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className={details.buttonClass} disabled={loading}>
              {loading ? "Processing..." : `Confirm ${targetStatus.toUpperCase()}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
