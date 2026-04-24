"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, CheckCircle, Clock, FileText, Loader2, Search, UserCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

type TrackStatus = string

interface TrackRecord {
  id: number | string
  registration_id: string
  surname: string
  firstname: string
  email: string
  department?: string | null
  position?: string | null
  status?: TrackStatus | null
  source?: string | null
  submission_date?: string | null
  created_at?: string | null
  updated_at?: string | null
}

interface TrackApiResponse {
  success: boolean
  type?: string
  status?: TrackStatus
  message?: string
  data?: TrackRecord
}

interface SearchResult {
  fullName: string
  registrationId: string
  email: string
  department: string
  position: string
  status: TrackStatus
  source: string
  submittedDate: string
  createdAt: string
  updatedAt: string
  recordType: string
}

const statusBadgeClasses: Record<string, string> = {
  pending_approval: "border-amber-200 bg-amber-50 text-amber-800",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-800",
  rejected: "border-rose-200 bg-rose-50 text-rose-800",
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  under_review: "border-sky-200 bg-sky-50 text-sky-800",
}

const formatDate = (value?: string | null) => {
  if (!value) return "N/A"
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString()
}

const normalizeSearchValue = (value: string) => value.trim()

const getStatusLabel = (status: string) =>
  status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")

const isTrackRecord = (value: unknown): value is TrackRecord =>
  Boolean(value) &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  "registration_id" in value &&
  "email" in value

const extractTrackRecord = (payload: unknown): TrackApiResponse | null => {
  if (!payload || typeof payload !== "object") {
    return null
  }

  const body = payload as Record<string, unknown>
  const nested = body.data as Record<string, unknown> | undefined
  const candidate =
    (isTrackRecord(body.data) ? body.data : null) ||
    (isTrackRecord(body.record) ? body.record : null) ||
    (isTrackRecord(body.employee) ? body.employee : null) ||
    (isTrackRecord(body.application) ? body.application : null) ||
    (isTrackRecord(body.result) ? body.result : null) ||
    (nested && isTrackRecord(nested.data) ? nested.data : null) ||
    (nested && isTrackRecord(nested.record) ? nested.record : null) ||
    (nested && isTrackRecord(nested.employee) ? nested.employee : null)

  return {
    success: Boolean(body.success),
    type: typeof body.type === "string" ? body.type : undefined,
    status: typeof body.status === "string" ? body.status : undefined,
    message: typeof body.message === "string" ? body.message : undefined,
    data: candidate || undefined,
  }
}

const resolveApiBaseUrl = () => {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.BACKEND_SERVICE_URL ||
    "https://ippis-backend.onrender.com"

  const trimmed = raw.trim().replace(/\/+$/, "")
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`
}

const buildTrackSearchUrls = (method: "id" | "email", value: string) => {
  if (method === "email") {
    const encodedEmail = encodeURIComponent(value.toLowerCase())
    return [`${resolveApiBaseUrl()}/track?email=${encodedEmail}`]
  }

  const normalizedVariants = Array.from(
    new Set([
      value,
      value.replace(/\s+/g, " "),
      value.replace(/\s+/g, ""),
    ].map((item) => item.trim()).filter(Boolean)),
  )

  return normalizedVariants.flatMap((variant) => {
    const encoded = encodeURIComponent(variant)
    return [
      `${resolveApiBaseUrl()}/track?id=${encoded}`,
      `${resolveApiBaseUrl()}/track?registration_id=${encoded}`,
      `${resolveApiBaseUrl()}/track?registrationId=${encoded}`,
    ]
  })
}

export default function TrackApplicationPage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const initialId = searchParams.get("id") ?? ""

  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchMethod, setSearchMethod] = useState<"id" | "email">("id")
  const [searchValue, setSearchValue] = useState(initialId)
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)

  const executeSearch = async (rawValue?: string, method?: "id" | "email") => {
    const value = normalizeSearchValue(rawValue ?? searchValue)
    const activeMethod = method ?? searchMethod

    if (!value) {
      toast({
        title: "Search value required",
        description: `Please enter a ${activeMethod === "id" ? "registration ID" : "email"} to search.`,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setHasSearched(true)
    setSearchResult(null)

    try {
      const urls = buildTrackSearchUrls(activeMethod, value)
      let lastError: string | null = null
      let foundResult: SearchResult | null = null

      for (const url of urls) {
        const res = await fetch(url, { cache: "no-store" })
        const rawPayload = await res.json().catch(() => null)
        const payload = extractTrackRecord(rawPayload)

        if (!res.ok) {
          lastError = payload?.message || `Request failed (${res.status})`
          continue
        }

        if (payload?.data) {
          const record = payload.data
          const fullName = `${record.surname ?? ""} ${record.firstname ?? ""}`.trim() || "Applicant"

          foundResult = {
            fullName,
            registrationId: record.registration_id,
            email: record.email,
            department: record.department || "N/A",
            position: record.position || "N/A",
            status: record.status || payload.status || "pending_approval",
            source: record.source || "N/A",
            submittedDate: record.submission_date || record.created_at || "N/A",
            createdAt: record.created_at || "N/A",
            updatedAt: record.updated_at || "N/A",
            recordType: payload.type || "application",
          }
          break
        }

        lastError = payload?.message || "Application not found"
      }

      if (!foundResult) {
        throw new Error(lastError || "Application not found")
      }

      setSearchResult(foundResult)
    } catch (error) {
      console.error("Track search error:", error)
      toast({
        title: "Search error",
        description: error instanceof Error ? error.message : "Unable to load application status.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (initialId) {
      setSearchMethod("id")
      setSearchValue(initialId)
      void executeSearch(initialId, "id")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId])

  const statusBadge = useMemo(() => {
    if (!searchResult) return null
    const status = searchResult.status || "pending_approval"
    const classes = statusBadgeClasses[status] || "border-slate-200 bg-slate-50 text-slate-700"

    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}>
        {status === "approved" ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
        {getStatusLabel(status)}
      </div>
    )
  }, [searchResult])

  const summaryCards = searchResult
    ? [
        { label: "Registration ID", value: searchResult.registrationId, icon: FileText },
        { label: "Status", value: getStatusLabel(searchResult.status), icon: Clock },
        { label: "Department", value: searchResult.department, icon: UserCircle2 },
      ]
    : []

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-center">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Coat_of_arms_of_Nigeria.svg-IFrFqiae8fXtNsVx4Ip0AeHFPjj7Mp.png"
              width={50}
              height={50}
              alt="Coat of Arms of Nigeria"
              className="h-12 w-auto"
            />
            <span className="text-2xl font-bold">IPPIS</span>
          </Link>
        </div>

        <Card className="border-red-200 shadow-lg">
          <CardHeader>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
              Onboarding status check
            </div>
            <CardTitle className="text-2xl text-center">Track Your Application</CardTitle>
            <CardDescription className="text-center">
              Enter your registration ID or email to check your onboarding status.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs
              defaultValue={searchMethod}
              className="w-full"
              onValueChange={(value) => {
                setSearchMethod(value as "id" | "email")
                setSearchValue("")
                setSearchResult(null)
                setHasSearched(false)
              }}
            >
              <TabsList className="mx-auto mb-6 grid w-full max-w-md grid-cols-2 gap-1 rounded-full border border-emerald-200 bg-white/80 p-1 shadow-sm">
                <TabsTrigger
                  value="id"
                  className="rounded-full border border-emerald-200 bg-white px-5 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-white/80 data-[state=active]:border-emerald-600 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  Search by ID
                </TabsTrigger>
                <TabsTrigger
                  value="email"
                  className="rounded-full border border-emerald-200 bg-white px-5 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-white/80 data-[state=active]:border-emerald-600 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  Search by Email
                </TabsTrigger>
              </TabsList>

              <TabsContent value="id" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="registration-id">Registration ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="registration-id"
                      placeholder="e.g. IPPIS 010"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                    />
                    <Button
                      onClick={() => void executeSearch(searchValue, "id")}
                      disabled={isLoading || searchValue.trim() === ""}
                      className="bg-[#008751] hover:bg-[#00724a] whitespace-nowrap"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" /> Send
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="email" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g. user@example.com"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                    />
                    <Button
                      onClick={() => void executeSearch(searchValue, "email")}
                      disabled={isLoading || searchValue.trim() === ""}
                      className="bg-[#008751] hover:bg-[#00724a] whitespace-nowrap"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" /> Send
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {searchResult && (
              <div className="mt-8 space-y-6">
                <div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{searchResult.recordType}</p>
                      <h3 className="mt-2 text-2xl font-semibold text-slate-950">{searchResult.fullName}</h3>
                      <p className="mt-1 text-sm text-slate-500">ID: {searchResult.registrationId}</p>
                    </div>
                    <div>{statusBadge}</div>
                  </div>

                  <div className="mt-6 grid gap-3 md:grid-cols-3">
                    {summaryCards.map((card) => {
                      const Icon = card.icon
                      return (
                        <div key={card.label} className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                          <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                            <Icon className="h-4 w-4" />
                          </div>
                          <p className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">{card.label}</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">{card.value}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Card className="border-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Application Details</CardTitle>
                      <CardDescription>Live information returned from the onboarding API.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Email</p>
                        <p className="mt-1 text-sm text-slate-900">{searchResult.email}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Department</p>
                        <p className="mt-1 text-sm text-slate-900">{searchResult.department}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Position</p>
                        <p className="mt-1 text-sm text-slate-900">{searchResult.position}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Source</p>
                        <p className="mt-1 text-sm text-slate-900">{searchResult.source}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Timeline</CardTitle>
                      <CardDescription>Track submission and update timestamps.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Submitted</p>
                        <p className="mt-1 text-sm text-slate-900">{formatDate(searchResult.submittedDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Created</p>
                        <p className="mt-1 text-sm text-slate-900">{formatDate(searchResult.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Last Updated</p>
                        <p className="mt-1 text-sm text-slate-900">{formatDate(searchResult.updatedAt)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">
                  If you have any questions or need further assistance, please contact the IPPIS support team.
                </div>
              </div>
            )}

            {!searchResult && !isLoading && hasSearched && (
              <p className="mt-8 text-center text-sm text-red-600">No application found matching your search.</p>
            )}
          </CardContent>

          <CardFooter className="justify-center">
            <Link href="/" className="inline-flex items-center gap-2 text-sm underline underline-offset-2">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
