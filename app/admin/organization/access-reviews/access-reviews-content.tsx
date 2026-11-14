"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
  useGetAccessReviews,
  useGetAccessReviewDetails,
  useStartAccessReview,
  useDecideReviewItem,
  useCloseAccessReview,
} from "@/services/hooks/access/useAccess"
import { useGetCompanies } from "@/services/hooks/organizations/company/useCompany"
import type { AccessReview, AccessReviewItem } from "@/types/access"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Progress } from "@/components/ui/progress"
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Play,
  RotateCcw,
  Building2,
  User,
  KeyRound,
  AlertCircle,
  Loader2,
  Clock,
  Search,
  ArrowLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

export function AccessReviewsContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const preselectedCompanyId = searchParams.get("company_id") || ""

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(preselectedCompanyId)
  const [activeReviewId, setActiveReviewId] = useState<string | number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDecision, setFilterDecision] = useState<string>("all")
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false)

  // API Queries & Mutations
  const { data: companiesResponse, isLoading: isLoadingCompanies } = useGetCompanies()
  const { data: reviewsResponse, isLoading: isLoadingReviews, refetch: refetchReviews } = useGetAccessReviews(
    selectedCompanyId ? { company_id: selectedCompanyId } : undefined
  )
  const {
    data: reviewDetailsResponse,
    isLoading: isLoadingDetails,
    refetch: refetchDetails,
  } = useGetAccessReviewDetails(activeReviewId || "")

  const startReviewMutation = useStartAccessReview()
  const decideMutation = useDecideReviewItem()
  const closeMutation = useCloseAccessReview()

  const companies = useMemo(() => companiesResponse?.data || [], [companiesResponse])
  const reviews: AccessReview[] = useMemo(() => reviewsResponse?.data || [], [reviewsResponse])

  // Active review data
  const currentReview: AccessReview | null = useMemo(() => {
    return reviewDetailsResponse?.data?.review || reviews.find((r) => String(r.id) === String(activeReviewId)) || null
  }, [reviewDetailsResponse, reviews, activeReviewId])

  const reviewItems: AccessReviewItem[] = useMemo(() => {
    return reviewDetailsResponse?.data?.items || []
  }, [reviewDetailsResponse])

  // Select the newest review by default if not set
  useEffect(() => {
    if (!activeReviewId && reviews.length > 0) {
      const inProgress = reviews.find((r) => r.status === "in_progress")
      setActiveReviewId(inProgress ? inProgress.id : reviews[0].id)
    }
  }, [reviews, activeReviewId])

  // Is current user reviewing their own item?
  const isSelfItem = (item: AccessReviewItem) => {
    if (!user) return false
    return String(item.user_id) === String(user.id) || (user.name && item.user_name === user.name)
  }

  // Filter items in active review
  const filteredItems = useMemo(() => {
    return reviewItems.filter((item) => {
      if (filterDecision !== "all" && item.decision !== filterDecision) return false
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const name = (item.user_name || "").toLowerCase()
        const email = (item.user_email || "").toLowerCase()
        const dept = (item.department_name || "").toLowerCase()
        const role = (item.role_name || "").toLowerCase()
        const perm = (item.permission_name || item.permission_key || "").toLowerCase()
        return (
          name.includes(query) ||
          email.includes(query) ||
          dept.includes(query) ||
          role.includes(query) ||
          perm.includes(query)
        )
      }
      return true
    })
  }, [reviewItems, filterDecision, searchTerm])

  // Review Progress Calculations
  const progressStats = useMemo(() => {
    const total = reviewItems.length
    const decided = reviewItems.filter((item) => item.decision !== "pending").length
    const kept = reviewItems.filter((item) => item.decision === "keep").length
    const revoked = reviewItems.filter((item) => item.decision === "revoke").length
    const percent = total > 0 ? Math.round((decided / total) * 100) : 0
    const allDecided = total > 0 && decided === total
    return { total, decided, kept, revoked, percent, allDecided }
  }, [reviewItems])

  // Handlers
  const handleStartReview = async () => {
    const companyIdToUse = selectedCompanyId || (companies[0]?.id ? String(companies[0].id) : "")
    if (!companyIdToUse) {
      toast.error("Please select an MDA to review")
      return
    }

    try {
      const res = await startReviewMutation.mutateAsync({ company_id: companyIdToUse })
      toast.success("Access review initiated", {
        description: "Review items generated for all roles and permissions.",
      })
      setIsStartDialogOpen(false)
      refetchReviews()
      if (res?.data?.id) {
        setActiveReviewId(res.data.id)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to start access review")
    }
  }

  const handleDecision = async (item: AccessReviewItem, decision: "keep" | "revoke") => {
    if (!activeReviewId) return
    if (isSelfItem(item)) {
      toast.error("Nobody reviews their own access.")
      return
    }

    try {
      await decideMutation.mutateAsync({
        reviewId: activeReviewId,
        payload: {
          item_id: item.id,
          decision,
        },
      })
      if (decision === "revoke") {
        toast.warning(`Access for ${item.user_name} marked as REVOKE`, {
          description: "Revocation takes effect immediately.",
        })
      } else {
        toast.success(`Access for ${item.user_name} marked as KEEP`)
      }
      refetchDetails()
    } catch (err: any) {
      toast.error(err.message || "Failed to update review decision")
    }
  }

  const handleCloseReview = async () => {
    if (!activeReviewId) return
    if (!progressStats.allDecided) {
      toast.error("A review can only be closed once every item is decided.")
      return
    }

    try {
      await closeMutation.mutateAsync(activeReviewId)
      toast.success("Access review closed successfully", {
        description: "The MDA's Last Reviewed timestamp has been updated.",
      })
      refetchReviews()
      refetchDetails()
    } catch (err: any) {
      toast.error(err.message || "Failed to close access review")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            Governance & Audit
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            MDA Access Reviews
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Access administrators review every assigned role and permission in an MDA. Mark each
            item as Keep or Revoke. Revoking takes effect immediately.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/organization/company")}
            className="h-10 text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to MDAs
          </Button>
          <Button
            onClick={() => setIsStartDialogOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-4 text-xs shadow-sm flex items-center gap-1.5"
          >
            <Play className="h-3.5 w-3.5" />
            Start New Review
          </Button>
        </div>
      </div>

      {/* Selector & Overview Strip */}
      <Card className="border border-slate-200 bg-slate-50/60 shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-600">Filter by MDA</Label>
              <Select
                value={selectedCompanyId || "all"}
                onValueChange={(val) => {
                  setSelectedCompanyId(val === "all" ? "" : val)
                  setActiveReviewId(null)
                }}
              >
                <SelectTrigger className="h-9 w-60 text-xs bg-white">
                  <SelectValue placeholder="All MDAs" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">All MDAs</SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name} {c.code ? `(${c.code})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {reviews.length > 0 && (
              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-600">Select Review Batch</Label>
                <Select
                  value={activeReviewId ? String(activeReviewId) : ""}
                  onValueChange={(val) => setActiveReviewId(val)}
                >
                  <SelectTrigger className="h-9 w-72 text-xs bg-white">
                    <SelectValue placeholder="Choose a review" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {reviews.map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {r.company_name} — {format(new Date(r.created_at), "MMM d, yyyy")}{" "}
                        ({r.status === "in_progress" ? "In Progress" : "Completed"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {currentReview && (
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-slate-200">
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-900">{currentReview.company_name}</p>
                <p className="text-[11px] text-slate-500">
                  Status:{" "}
                  <span
                    className={`font-semibold ${
                      currentReview.status === "in_progress" ? "text-amber-600" : "text-emerald-600"
                    }`}
                  >
                    {currentReview.status === "in_progress" ? "In Progress" : "Completed"}
                  </span>
                </p>
              </div>
              <Badge
                variant="outline"
                className={
                  currentReview.status === "in_progress"
                    ? "border-amber-200 bg-amber-50 text-amber-800"
                    : "border-emerald-200 bg-emerald-50 text-emerald-800"
                }
              >
                {currentReview.status === "in_progress" ? "Active Review" : "Closed"}
              </Badge>
            </div>
          )}
        </div>
      </Card>

      {/* Review In-Progress Workspace */}
      {currentReview ? (
        <div className="space-y-6">
          {/* Progress Banner */}
          <Card className="border border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-white to-slate-50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    Review Progress: {progressStats.decided} of {progressStats.total} items decided
                    ({progressStats.percent}%)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {progressStats.allDecided
                      ? "All items have been reviewed! You may now close this review."
                      : "Every item must be explicitly marked Keep or Revoke before the review can be closed."}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                      Keep: {progressStats.kept}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-medium">
                      Revoke: {progressStats.revoked}
                    </span>
                  </div>

                  {currentReview.status === "in_progress" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Button
                              onClick={handleCloseReview}
                              disabled={!progressStats.allDecided || closeMutation.isPending}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-4 text-xs font-semibold shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {closeMutation.isPending ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                              ) : (
                                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                              )}
                              Close Review
                            </Button>
                          </span>
                        </TooltipTrigger>
                        {!progressStats.allDecided && (
                          <TooltipContent>
                            <p className="text-xs">
                              A review can only be closed once every item is decided.
                            </p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>

              <Progress value={progressStats.percent} className="h-2.5 bg-slate-100" />
            </CardContent>
          </Card>

          {/* Items Table & Controls */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="p-4 border-b border-slate-100 bg-slate-50/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      placeholder="Search employee, department, role..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-8 text-xs bg-white"
                    />
                  </div>
                  <Select value={filterDecision} onValueChange={setFilterDecision}>
                    <SelectTrigger className="h-8 w-36 text-xs bg-white">
                      <SelectValue placeholder="All Decisions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="keep">Kept</SelectItem>
                      <SelectItem value="revoke">Revoked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-xs text-slate-500">
                  Showing {filteredItems.length} of {reviewItems.length} items
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {isLoadingDetails ? (
                <div className="py-16 text-center text-slate-500">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-600 mb-2" />
                  Loading review items...
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="py-16 text-center text-slate-500">
                  <ShieldCheck className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-medium text-slate-700">No items match your criteria</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredItems.map((item) => {
                    const self = isSelfItem(item)
                    const isClosed = currentReview.status === "completed"

                    return (
                      <div
                        key={item.id}
                        className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                          item.decision === "revoke"
                            ? "bg-rose-50/30"
                            : item.decision === "keep"
                            ? "bg-emerald-50/20"
                            : "hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 text-sm">
                              {item.user_name}
                            </span>
                            {self && (
                              <Badge
                                variant="outline"
                                className="border-blue-200 text-blue-700 bg-blue-50 text-[10px]"
                              >
                                You
                              </Badge>
                            )}
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-500">{item.user_email}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                            {item.department_name && (
                              <span className="inline-flex items-center gap-1">
                                <Building2 className="h-3 w-3 text-slate-400" />
                                {item.department_name}
                              </span>
                            )}
                            {item.role_name && (
                              <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                                <KeyRound className="h-3 w-3 text-slate-400" />
                                Role: {item.role_name}
                              </span>
                            )}
                            {(item.permission_name || item.permission_key) && (
                              <Badge variant="outline" className="text-[10px] bg-slate-50">
                                Permission: {item.permission_name || item.permission_key}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Decision actions */}
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <Button
                                    size="sm"
                                    onClick={() => handleDecision(item, "keep")}
                                    disabled={self || isClosed || decideMutation.isPending}
                                    variant={item.decision === "keep" ? "default" : "outline"}
                                    className={`h-8 px-3 text-xs font-medium ${
                                      item.decision === "keep"
                                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                        : "border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                                  >
                                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                                    Keep
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              {self && (
                                <TooltipContent>
                                  <p className="text-xs">Nobody reviews their own access.</p>
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
                                    onClick={() => handleDecision(item, "revoke")}
                                    disabled={self || isClosed || decideMutation.isPending}
                                    variant={item.decision === "revoke" ? "default" : "outline"}
                                    className={`h-8 px-3 text-xs font-medium ${
                                      item.decision === "revoke"
                                        ? "bg-rose-600 hover:bg-rose-700 text-white"
                                        : "border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700"
                                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                                  >
                                    <XCircle className="mr-1.5 h-3.5 w-3.5" />
                                    Revoke
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              {self && (
                                <TooltipContent>
                                  <p className="text-xs">Nobody reviews their own access.</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border border-dashed border-slate-300 p-12 text-center">
          <ShieldAlert className="h-10 w-10 mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No Access Review Selected</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Select an MDA from the list above or initiate a new access review to audit roles and
            permissions.
          </p>
          <Button
            onClick={() => setIsStartDialogOpen(true)}
            className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 px-4"
          >
            Start Access Review
          </Button>
        </Card>
      )}

      {/* Start Review Dialog */}
      <Dialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Initiate Access Review
            </DialogTitle>
            <DialogDescription>
              Start an access review cycle for an MDA. This collects all assigned roles and
              permissions so an Access Administrator can mark each one Keep or Revoke.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="reviewMda" className="text-xs font-semibold text-slate-700">
                Select MDA <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={selectedCompanyId || (companies[0]?.id ? String(companies[0].id) : "")}
                onValueChange={setSelectedCompanyId}
              >
                <SelectTrigger id="reviewMda" className="h-10">
                  <SelectValue placeholder="Choose MDA" />
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

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Revoking an item takes effect immediately. The review can only be closed once every
                single item has been decided.
              </span>
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsStartDialogOpen(false)}
              disabled={startReviewMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleStartReview}
              disabled={startReviewMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {startReviewMutation.isPending ? "Generating Review..." : "Start Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
