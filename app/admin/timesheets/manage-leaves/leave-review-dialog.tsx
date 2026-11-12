"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  User,
  Building2,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { canApproveLeave, isSelfLeave } from "@/lib/leave-permissions";
import { useReviewLeaveStatus } from "@/services/hooks/timesheets/leaves";
import type { LeaveRecord } from "@/types/timesheets/leaves";

interface LeaveReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  leave: LeaveRecord | null;
  onSuccess?: () => void;
}

const formatDateSafely = (val?: string | null) => {
  if (!val) return "Not specified";
  const date = new Date(val);
  return Number.isNaN(date.getTime()) ? val : format(date, "PPP");
};

export function LeaveReviewDialog({
  isOpen,
  onClose,
  leave,
  onSuccess,
}: LeaveReviewDialogProps) {
  const { user } = useAuth();
  const reviewMutation = useReviewLeaveStatus();

  const [rejectionRemarks, setRejectionRemarks] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!leave) return null;

  const isSelf = isSelfLeave(user, leave);
  const userCanApprove = canApproveLeave(user);
  const canDecide = userCanApprove && !isSelf;

  const handleApprove = () => {
    if (!canDecide) return;

    reviewMutation.mutate(
      {
        id: leave.id,
        status: "approved",
      },
      {
        onSuccess: () => {
          toast.success("Leave Request Approved", {
            description: `Statutory leave for ${leave.employee_name || leave.employee_code} has been approved.`,
          });
          onClose();
          onSuccess?.();
        },
        onError: (err: any) => {
          toast.error("Approval Failed", {
            description: err?.message || "Failed to approve leave request.",
          });
        },
      }
    );
  };

  const handleReject = () => {
    if (!canDecide) return;

    reviewMutation.mutate(
      {
        id: leave.id,
        status: "rejected",
        remarks: rejectionRemarks.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Leave Request Rejected", {
            description: `Leave request for ${leave.employee_name || leave.employee_code} was rejected.`,
          });
          setShowRejectForm(false);
          setRejectionRemarks("");
          onClose();
          onSuccess?.();
        },
        onError: (err: any) => {
          toast.error("Rejection Failed", {
            description: err?.message || "Failed to update leave request.",
          });
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden">
        <DialogHeader className="p-6 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900">
                  Review Leave Application
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Civil service leave governance & statutory verification under PSR Chapter 10.
                </DialogDescription>
              </div>
            </div>
            <Badge
              className={`capitalize px-2.5 py-1 text-xs ${
                leave.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : leave.status === "rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {leave.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Permission Warnings */}
          {isSelf && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Self-Approval Governance Restriction</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Civil service regulations strictly prohibit officers from approving their own leave applications. Another authorized supervisor or Central HR must review this request.
                </p>
              </div>
            </div>
          )}

          {!userCanApprove && !isSelf && (
            <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-lg flex items-start gap-2.5 text-slate-700">
              <AlertTriangle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Authorization Scope Notice</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Leave approval authority is restricted to Department Heads and Central HR administrators within the officer's MDA.
                </p>
              </div>
            </div>
          )}

          {/* Applicant & Posting Details */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50/70 border border-slate-100 rounded-xl">
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Applicant Officer
              </span>
              <p className="font-bold text-slate-900 text-sm">
                {leave.employee_name || "Nominal Roll Officer"}
              </p>
              <p className="text-[11px] text-slate-600 font-mono">
                IPPIS No: {leave.employee_code}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Department & Posting
              </span>
              <p className="font-semibold text-slate-900">
                {leave.department || "All In Scope"}
              </p>
              <p className="text-[11px] text-slate-500">Federal Civil Service</p>
            </div>
          </div>

          {/* Leave Specifics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Leave Category
              </span>
              <p className="text-sm font-bold text-slate-900 mt-1">{leave.leave_type}</p>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Duration
              </span>
              <p className="text-sm font-bold text-emerald-700 mt-1">
                {leave.days ? `${leave.days} Days` : "Specified Window"}
              </p>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Submission Date
              </span>
              <p className="text-xs font-semibold text-slate-800 mt-1">
                {formatDateSafely(leave.created_at)}
              </p>
            </div>
          </div>

          {/* Schedule Window */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Statutory Period Window
            </span>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400">Commencement Date</span>
                <p className="font-semibold text-slate-800">{formatDateSafely(leave.from_date)}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Resumption Date</span>
                <p className="font-semibold text-slate-800">{formatDateSafely(leave.to_date)}</p>
              </div>
            </div>
          </div>

          {/* Justification / Reason */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Reason & Officer Justification
            </span>
            <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-700 whitespace-pre-wrap leading-relaxed">
              {leave.reason || "No explicit reason was documented."}
            </div>
          </div>

          {/* Reject remarks field when toggled */}
          {showRejectForm && (
            <div className="space-y-2 p-3.5 bg-red-50/70 border border-red-200 rounded-lg">
              <Label className="text-xs font-bold text-red-900">
                Reason for Rejection *
              </Label>
              <Textarea
                rows={2}
                placeholder="State the regulatory or operational grounds for rejecting this leave request..."
                value={rejectionRemarks}
                onChange={(e) => setRejectionRemarks(e.target.value)}
                className="text-xs bg-white"
              />
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRejectForm(false)}
                >
                  Cancel Rejection
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white font-medium"
                  onClick={handleReject}
                  disabled={reviewMutation.isPending}
                >
                  {reviewMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Confirm Rejection"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between sm:justify-between">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          {canDecide && !showRejectForm && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-medium"
                onClick={() => setShowRejectForm(true)}
                disabled={reviewMutation.isPending || leave.status === "rejected"}
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                Reject
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                onClick={handleApprove}
                disabled={reviewMutation.isPending || leave.status === "approved"}
              >
                {reviewMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Approve Leave
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
