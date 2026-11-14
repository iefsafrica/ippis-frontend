"use client"

import { useState, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import {
  useGetAccessRequests,
  useCreateAccessRequest,
  useApproveAccessRequest,
  useRejectAccessRequest,
  useRevokeAccessRequest,
} from "@/services/hooks/access/useAccess"
import { useGetCompanies } from "@/services/hooks/organizations/company/useCompany"
import { useGetRoles } from "@/services/hooks/roles"
import type { TemporaryAccessRequest, CreateAccessRequestPayload } from "@/types/access"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  Plus,
  Search,
  Building2,
  Calendar,
  AlertCircle,
  Loader2,
  KeyRound,
  Filter,
} from "lucide-react"
import { toast } from "sonner"
import { format, differenceInDays } from "date-fns"

export function AccessRequestsContent() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<string>("all")

  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [isRevokeOpen, setIsRevokeOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<TemporaryAccessRequest | null>(null)
  const [actionReason, setActionReason] = useState("")

  // Form State for creating a new request
  const [targetCompanyId, setTargetCompanyId] = useState<string>("")
  const [roleId, setRoleId] = useState<string>("")
  const [durationDays, setDurationDays] = useState<number>(30)
  const [requestReason, setRequestReason] = useState<string>("")

  // Queries & Mutations
  const { data: requestsResponse, isLoading: isLoadingRequests, refetch } = useGetAccessRequests()
  const { data: companiesResponse } = useGetCompanies()
  const { data: rolesResponse } = useGetRoles()

  const createMutation = useCreateAccessRequest()
  const approveMutation = useApproveAccessRequest()
  const rejectMutation = useRejectAccessRequest()
  const revokeMutation = useRevokeAccessRequest()

  const requests: TemporaryAccessRequest[] = useMemo(() => {
    return requestsResponse?.data || []
  }, [requestsResponse])

  const companies = useMemo(() => {
    return companiesResponse?.data || []
  }, [companiesResponse])

  const roles = useMemo(() => {
    return rolesResponse?.data || []
  }, [rolesResponse])

  // Is current user an Access Admin or Central Admin?
  const isSuperOrCentralAdmin = useMemo(() => {
    if (!user) return false
    const roleLower = (user.role || "").toLowerCase()
    const roleKeyLower = (user.role_key || "").toLowerCase()
    return (
      roleLower.includes("super") ||
      roleKeyLower.includes("super") ||
      roleLower.includes("central") ||
      roleKeyLower.includes("central") ||
      user.is_access_admin === true
    )
  }, [user])

  // Can approve/reject a request in target MDA
  const canManageTargetMDA = (request: TemporaryAccessRequest) => {
    if (!user) return false
    if (isSuperOrCentralAdmin) return true
    if (
      user.is_access_admin &&
      user.company_id &&
      String(user.company_id) === String(request.target_company_id)
    ) {
      return true
    }
    return false
  }

  // Check if request is user's own request
  const isSelfRequest = (request: TemporaryAccessRequest) => {
    if (!user) return false
    return String(request.user_id) === String(user.id)
  }

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // Tab filter
      if (activeTab === "pending" && req.status !== "pending") return false
      if (activeTab === "my" && !isSelfRequest(req)) return false
      if (activeTab === "to_review") {
        if (req.status !== "pending") return false
        if (isSelfRequest(req)) return false
        if (!canManageTargetMDA(req)) return false
      }

      // Status filter dropdown
      if (selectedStatus !== "all" && req.status !== selectedStatus) return false

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const userName = (req.user_name || "").toLowerCase()
        const userEmail = (req.user_email || "").toLowerCase()
        const company = (req.company_name || "").toLowerCase()
        const role = (req.role_name || "").toLowerCase()
        const reason = (req.reason || "").toLowerCase()
        return (
          userName.includes(query) ||
          userEmail.includes(query) ||
          company.includes(query) ||
          role.includes(query) ||
          reason.includes(query)
        )
      }

      return true
    })
  }, [requests, activeTab, selectedStatus, searchTerm, user])

  // Metrics
  const stats = useMemo(() => {
    const total = requests.length
    const pending = requests.filter((r) => r.status === "pending").length
    const active = requests.filter((r) => r.status === "approved").length
    const myPending = requests.filter((r) => r.status === "pending" && isSelfRequest(r)).length
    return { total, pending, active, myPending }
  }, [requests, user])

  // Handlers
  const handleOpenCreate = () => {
    setTargetCompanyId("")
    setRoleId("")
    setDurationDays(30)
    setRequestReason("")
    setIsCreateOpen(true)
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetCompanyId) {
      toast.error("Please select a target MDA")
      return
    }
    if (!roleId) {
      toast.error("Please select a role")
      return
    }
    if (durationDays < 1 || durationDays > 90) {
      toast.error("Duration must be between 1 and 90 days")
      return
    }
    if (!requestReason.trim()) {
      toast.error("Please provide a valid reason for requesting temporary access")
      return
    }

    try {
      const payload: CreateAccessRequestPayload = {
        target_company_id: targetCompanyId,
        role_id: roleId,
        duration_days: durationDays,
        reason: requestReason.trim(),
      }
      await createMutation.mutateAsync(payload)
      toast.success("Access request submitted successfully", {
        description: "The MDA Access Administrator will review your request.",
      })
      setIsCreateOpen(false)
      refetch()
    } catch (err: any) {
      toast.error(err.message || "Failed to submit access request")
    }
  }

  const handleApprove = async (request: TemporaryAccessRequest) => {
    if (isSelfRequest(request)) {
      toast.error("You cannot approve your own request.")
      return
    }
    if (!canManageTargetMDA(request)) {
      toast.error("Only an Access Administrator of this MDA can approve requests.")
      return
    }

    try {
      await approveMutation.mutateAsync(request.id)
      toast.success("Access request approved", {
        description: `Temporary access granted for ${request.duration_days} days.`,
      })
      refetch()
    } catch (err: any) {
      toast.error(err.message || "Failed to approve access request")
    }
  }

  const handleOpenReject = (request: TemporaryAccessRequest) => {
    if (isSelfRequest(request)) {
      toast.error("You cannot reject your own request.")
      return
    }
    setSelectedRequest(request)
    setActionReason("")
    setIsRejectOpen(true)
  }

  const handleRejectConfirm = async () => {
    if (!selectedRequest) return
    try {
      await rejectMutation.mutateAsync({
        requestId: selectedRequest.id,
        reason: actionReason.trim(),
      })
      toast.success("Access request rejected")
      setIsRejectOpen(false)
      setSelectedRequest(null)
      refetch()
    } catch (err: any) {
      toast.error(err.message || "Failed to reject request")
    }
  }

  const handleOpenRevoke = (request: TemporaryAccessRequest) => {
    setSelectedRequest(request)
    setActionReason("")
    setIsRevokeOpen(true)
  }

  const handleRevokeConfirm = async () => {
    if (!selectedRequest) return
    try {
      await revokeMutation.mutateAsync({
        requestId: selectedRequest.id,
        reason: actionReason.trim(),
      })
      toast.success("Temporary access revoked immediately")
      setIsRevokeOpen(false)
      setSelectedRequest(null)
      refetch()
    } catch (err: any) {
      toast.error(err.message || "Failed to revoke access")
    }
  }

  const getStatusBadge = (status: TemporaryAccessRequest["status"]) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Active / Approved</Badge>
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending Review</Badge>
      case "rejected":
        return <Badge className="bg-rose-100 text-rose-800 border-rose-200">Rejected</Badge>
      case "revoked":
        return <Badge className="bg-slate-100 text-slate-800 border-slate-200">Revoked Early</Badge>
      case "expired":
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Expired</Badge>
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
            <KeyRound className="h-3.5 w-3.5" />
            Cross-MDA Access Control
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Temporary Access Requests
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Request temporary roles in other MDAs for up to 90 days. Requests are approved by MDA
            Access Administrators and expire automatically.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-2 h-11 px-5"
        >
          <Plus className="h-4 w-4" />
          Request Temporary Access
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Requests</CardTitle>
            <ShieldAlert className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <p className="text-xs text-slate-500 mt-1">Cross-MDA access requests</p>
          </CardContent>
        </Card>

        <Card className="border border-amber-200 bg-amber-50/40 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">{stats.pending}</div>
            <p className="text-xs text-amber-700 mt-1">Awaiting MDA Access Admin action</p>
          </CardContent>
        </Card>

        <Card className="border border-emerald-200 bg-emerald-50/40 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">Active Access</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">{stats.active}</div>
            <p className="text-xs text-emerald-700 mt-1">Currently active delegated roles</p>
          </CardContent>
        </Card>

        <Card className="border border-blue-200 bg-blue-50/40 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">My Requests</CardTitle>
            <KeyRound className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {requests.filter((r) => isSelfRequest(r)).length}
            </div>
            <p className="text-xs text-blue-700 mt-1">{stats.myPending} pending decision</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="p-6 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full md:w-auto"
            >
              <TabsList className="bg-slate-100 p-1">
                <TabsTrigger value="all" className="text-xs">
                  All Requests ({requests.length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-xs">
                  Pending ({stats.pending})
                </TabsTrigger>
                <TabsTrigger value="my" className="text-xs">
                  My Requests ({requests.filter((r) => isSelfRequest(r)).length})
                </TabsTrigger>
                {isSuperOrCentralAdmin && (
                  <TabsTrigger value="to_review" className="text-xs">
                    Needs My Approval
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search user, MDA, role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-9 w-36 text-xs">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoadingRequests ? (
            <div className="py-16 text-center text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600 mb-2" />
              Loading access requests...
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <ShieldAlert className="h-10 w-10 mx-auto text-slate-300 mb-2" />
              <p className="font-medium text-slate-700">No access requests found</p>
              <p className="text-xs text-slate-400 mt-1">
                {searchTerm ? "Try adjusting your search criteria" : "Click 'Request Temporary Access' to submit a new request"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredRequests.map((req) => {
                const selfReq = isSelfRequest(req)
                const canManage = canManageTargetMDA(req)
                const canApprove = canManage && !selfReq && req.status === "pending"
                const canRevoke = (canManage || selfReq) && req.status === "approved"

                return (
                  <div
                    key={req.id}
                    className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900 text-base">
                          {req.user_name || `User #${req.user_id}`}
                        </span>
                        {selfReq && (
                          <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 text-[10px]">
                            You
                          </Badge>
                        )}
                        <span className="text-slate-400 text-xs">•</span>
                        <span className="text-xs text-slate-500 font-medium">
                          {req.user_email || "No email"}
                        </span>
                        <span className="text-slate-400 text-xs">•</span>
                        {getStatusBadge(req.status)}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          <span>Target MDA:</span>
                          <span className="font-medium text-slate-800">
                            {req.company_name || `MDA #${req.target_company_id}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <KeyRound className="h-3.5 w-3.5 text-slate-400" />
                          <span>Requested Role:</span>
                          <span className="font-medium text-slate-800">
                            {req.role_name || `Role #${req.role_id}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>Duration:</span>
                          <span className="font-semibold text-emerald-700">
                            {req.duration_days} days
                          </span>
                        </div>
                      </div>

                      {req.reason && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-md border border-slate-200/60 mt-1">
                          <span className="font-semibold text-slate-700">Justification: </span>
                          {req.reason}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span>Submitted {format(new Date(req.created_at), "PPP")}</span>
                        {req.expires_at && (
                          <>
                            <span>•</span>
                            <span className="text-amber-700 font-medium">
                              Expires on {format(new Date(req.expires_at), "PPP")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 self-start lg:self-center">
                      {req.status === "pending" && (
                        <>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprove(req)}
                                    disabled={!canApprove || approveMutation.isPending}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-3 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                                    Approve
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              {!canApprove && (
                                <TooltipContent>
                                  <p className="text-xs">
                                    {selfReq
                                      ? "You cannot approve your own request."
                                      : "Only an Access Administrator for this MDA can approve."}
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
                                    onClick={() => handleOpenReject(req)}
                                    disabled={selfReq || !canManage}
                                    className="border-rose-200 text-rose-700 hover:bg-rose-50 h-9 px-3 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    <XCircle className="mr-1.5 h-3.5 w-3.5" />
                                    Reject
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              {selfReq && (
                                <TooltipContent>
                                  <p className="text-xs">You cannot reject your own request.</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </>
                      )}

                      {canRevoke && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenRevoke(req)}
                          className="border-amber-300 text-amber-700 hover:bg-amber-50 h-9 px-3 text-xs"
                        >
                          <Ban className="mr-1.5 h-3.5 w-3.5" />
                          Revoke Early
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

      {/* Request Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-emerald-600" />
              Request Temporary Access
            </DialogTitle>
            <DialogDescription>
              Request a temporary role in another MDA for up to 90 days. An Access Administrator of
              that MDA will review your request.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="targetMDA" className="text-xs font-semibold text-slate-700">
                Target MDA <span className="text-rose-500">*</span>
              </Label>
              <Select value={targetCompanyId} onValueChange={setTargetCompanyId}>
                <SelectTrigger id="targetMDA" className="h-10">
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

            <div className="space-y-2">
              <Label htmlFor="targetRole" className="text-xs font-semibold text-slate-700">
                Desired Role <span className="text-rose-500">*</span>
              </Label>
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger id="targetRole" className="h-10">
                  <SelectValue placeholder="Select role to request" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="duration" className="text-xs font-semibold text-slate-700">
                  Duration (Days) <span className="text-rose-500">* (Max 90 days)</span>
                </Label>
                <span className="text-xs font-bold text-emerald-700">{durationDays} Days</span>
              </div>
              <Input
                id="duration"
                type="number"
                min={1}
                max={90}
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="h-10"
              />
              <div className="flex items-center gap-1.5 pt-1">
                {[7, 14, 30, 60, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDurationDays(d)}
                    className={`text-[11px] px-2.5 py-1 rounded border font-medium transition ${
                      durationDays === d
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason" className="text-xs font-semibold text-slate-700">
                Business Reason / Justification <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="reason"
                rows={3}
                placeholder="Explain why you require access to this MDA (e.g. cross-agency audit, shared task execution)..."
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                required
              />
            </div>

            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Approved access is granted on a strictly temporary basis. Access automatically ends on
                the expiration date and can be revoked early by the MDA Access Administrator.
              </span>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <XCircle className="h-5 w-5" />
              Reject Access Request
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to reject the access request for{" "}
              <span className="font-semibold text-slate-900">
                {selectedRequest?.user_name || "this user"}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <Label htmlFor="rejectReason" className="text-xs font-semibold text-slate-700">
              Rejection Reason (Optional)
            </Label>
            <Textarea
              id="rejectReason"
              rows={3}
              placeholder="State the reason why access is denied..."
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
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
              {rejectMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Early Modal */}
      <Dialog open={isRevokeOpen} onOpenChange={setIsRevokeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <Ban className="h-5 w-5" />
              Revoke Temporary Access
            </DialogTitle>
            <DialogDescription>
              This will immediately revoke active temporary access for{" "}
              <span className="font-semibold text-slate-900">
                {selectedRequest?.user_name || "this user"}
              </span>{" "}
              in {selectedRequest?.company_name || "the target MDA"}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <Label htmlFor="revokeReason" className="text-xs font-semibold text-slate-700">
              Revocation Reason (Optional)
            </Label>
            <Textarea
              id="revokeReason"
              rows={3}
              placeholder="Why is this access being revoked early?..."
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRevokeOpen(false)}
              disabled={revokeMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRevokeConfirm}
              disabled={revokeMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {revokeMutation.isPending ? "Revoking..." : "Revoke Access Immediately"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
