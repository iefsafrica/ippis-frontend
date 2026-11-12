"use client";

import { useState, useMemo } from "react";
import { format, differenceInDays, isValid, parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle, Info, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { useApplyLeave } from "@/services/hooks/employee/useEmployeeLeave";
import type { LeaveBalanceItem } from "@/types/employee/leave";

interface ApplyLeaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  balances?: LeaveBalanceItem[];
  onSuccess?: () => void;
}

export function ApplyLeaveDialog({
  isOpen,
  onClose,
  balances = [],
  onSuccess,
}: ApplyLeaveDialogProps) {
  const applyMutation = useApplyLeave();

  const [leaveType, setLeaveType] = useState<string>("Annual Leave");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [relieverName, setRelieverName] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [contactAddress, setContactAddress] = useState<string>("");

  // Find balance for selected leave type
  const selectedBalance = useMemo(() => {
    return balances.find(
      (b) => b.leave_type.toLowerCase() === leaveType.toLowerCase()
    );
  }, [balances, leaveType]);

  // Calculate requested duration
  const requestedDays = useMemo(() => {
    if (!fromDate || !toDate) return 0;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (!isValid(start) || !isValid(end)) return 0;
    const diff = differenceInDays(end, start);
    return diff >= 0 ? diff + 1 : 0;
  }, [fromDate, toDate]);

  const isExceedingBalance = useMemo(() => {
    if (!selectedBalance || requestedDays <= 0) return false;
    return requestedDays > selectedBalance.days_available;
  }, [selectedBalance, requestedDays]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!leaveType) {
      toast.error("Please select a leave type.");
      return;
    }
    if (!fromDate || !toDate) {
      toast.error("Please provide both start and end dates.");
      return;
    }
    if (requestedDays <= 0) {
      toast.error("End date must be on or after the start date.");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please provide a reason / justification for this leave.");
      return;
    }

    applyMutation.mutate(
      {
        leave_type: leaveType,
        from_date: new Date(fromDate).toISOString(),
        to_date: new Date(toDate).toISOString(),
        reason: reason.trim(),
        reliever_name: relieverName.trim() || undefined,
        contact_phone: contactPhone.trim() || undefined,
        contact_address: contactAddress.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Leave Application Submitted", {
            description: `Your request for ${requestedDays} day(s) of ${leaveType} has been submitted for approval.`,
          });
          // Reset form
          setReason("");
          setRelieverName("");
          setContactPhone("");
          setContactAddress("");
          setFromDate("");
          setToDate("");
          onClose();
          onSuccess?.();
        },
        onError: (err: any) => {
          toast.error("Submission Failed", {
            description: err?.message || "Could not submit your leave application.",
          });
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden">
        <DialogHeader className="p-6 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Apply for Statutory Leave
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Submit an official civil service leave application under Public Service Rules (PSR Chapter 10).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Leave Type Selector with dynamic balance */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-700">Leave Type *</Label>
              {selectedBalance && (
                <span className="text-[11px] text-slate-500">
                  Available:{" "}
                  <strong className="text-emerald-700 font-bold">
                    {selectedBalance.days_available} days
                  </strong>{" "}
                  (Allowed: {selectedBalance.days_allowed})
                </span>
              )}
            </div>
            <Select value={leaveType} onValueChange={setLeaveType}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select leave category" />
              </SelectTrigger>
              <SelectContent>
                {balances.length > 0 ? (
                  balances.map((b) => (
                    <SelectItem key={b.leave_type} value={b.leave_type}>
                      {b.leave_type} — {b.days_available} days remaining
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="Annual Leave">Annual Leave (30 days max)</SelectItem>
                    <SelectItem value="Casual Leave">Casual Leave (7 days max)</SelectItem>
                    <SelectItem value="Sick Leave">Sick Leave (14 days max)</SelectItem>
                    <SelectItem value="Maternity / Paternity Leave">Maternity / Paternity Leave</SelectItem>
                    <SelectItem value="Bereavement Leave">Bereavement Leave</SelectItem>
                    <SelectItem value="Examination / Study Leave">Examination / Study Leave</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Date Pickers */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Commencement Date *</Label>
              <Input
                type="date"
                required
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Resumption Date *</Label>
              <Input
                type="date"
                required
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Duration Summary Banner */}
          {requestedDays > 0 && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                isExceedingBalance
                  ? "bg-amber-50 border-amber-200 text-amber-800"
                  : "bg-emerald-50 border-emerald-200 text-emerald-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {isExceedingBalance ? (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <span>
                  Total Duration: <strong>{requestedDays} calendar day(s)</strong>
                </span>
              </div>
              {selectedBalance && (
                <Badge
                  variant={isExceedingBalance ? "destructive" : "secondary"}
                  className="text-[10px]"
                >
                  {isExceedingBalance
                    ? `Exceeds balance by ${requestedDays - selectedBalance.days_available}d`
                    : `${selectedBalance.days_available - requestedDays}d will remain`}
                </Badge>
              )}
            </div>
          )}

          {/* Reliever / Handover Officer */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Handover / Reliever Officer</Label>
              <Input
                placeholder="e.g. Ibrahim Bala Musa"
                value={relieverName}
                onChange={(e) => setRelieverName(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Emergency Phone</Label>
              <Input
                placeholder="e.g. 0803 123 4567"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Contact Address while on leave */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Contact Address while on Leave</Label>
            <Input
              placeholder="e.g. Plot 42, Garki II, Abuja"
              value={contactAddress}
              onChange={(e) => setContactAddress(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          {/* Reason / Justification */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Reason / Justification *</Label>
            <Textarea
              required
              rows={3}
              placeholder="Explain the purpose of your leave request according to statutory guidelines..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="text-xs resize-none"
            />
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={applyMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium"
              disabled={applyMutation.isPending || requestedDays <= 0}
            >
              {applyMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
