"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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

interface TrackRegistrationBundle {
  registration?: {
    id?: number | string
    registration_id?: string | null
    nin?: string | null
    status?: TrackStatus | null
    current_step?: string | null
    declaration?: boolean | null
    created_at?: string | null
    updated_at?: string | null
    submitted_at?: string | null
    approved_at?: string | null
    rejected_at?: string | null
  } | null
  verification?: {
    registration_id?: string | null
    email?: string | null
    first_name?: string | null
    firstname?: string | null
    surname?: string | null
    status?: TrackStatus | null
  } | null
  personal?: {
    registration_id?: string | null
    first_name?: string | null
    firstname?: string | null
    surname?: string | null
    email?: string | null
    department?: string | null
    position?: string | null
    title?: string | null
    status?: TrackStatus | null
    created_at?: string | null
    updated_at?: string | null
  } | null
  employment?: {
    registration_id?: string | null
    department?: string | null
    position?: string | null
    rank_position?: string | null
    grade_level?: string | null
    status?: TrackStatus | null
    created_at?: string | null
    updated_at?: string | null
  } | null
  documents?: {
    registration_id?: string | null
    status?: TrackStatus | null
    upload_date?: string | null
    created_at?: string | null
    updated_at?: string | null
    appointment_letter_path?: string | null
    educational_certificates_path?: string | null
    promotion_letter_path?: string | null
    other_documents_path?: string | null
    profile_image_path?: string | null
    signature_path?: string | null
  } | null
}

interface PendingEmployeeRecord {
  id: string | number
  registration_id?: string | null
  surname?: string | null
  firstname?: string | null
  email?: string | null
  department?: string | null
  position?: string | null
  status?: string | null
  source?: string | null
  submission_date?: string | null
  created_at?: string | null
  updated_at?: string | null
  name?: string | null
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

const buildRegistrationIdVariants = (value: string) => {
  const normalized = value.trim()
  const compact = normalized.replace(/[\s-]+/g, "")
  const spaced = normalized.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim()
  const dashed = normalized.replace(/[\s_]+/g, "-").replace(/-+/g, "-").trim()

  return Array.from(
    new Set(
      [
        normalized,
        spaced,
        dashed,
        compact,
        compact.replace(/([A-Za-z]+)(\d+)/, "$1 $2"),
        compact.replace(/([A-Za-z]+)(\d+)/, "$1-$2"),
      ].filter(Boolean),
    ),
  )
}

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

const isTrackBundle = (value: unknown): value is TrackRegistrationBundle =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value) && "registration" in value

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

const buildSearchResultFromBundle = (
  bundle: TrackRegistrationBundle,
  recordType: string,
): SearchResult | null => {
  const registration = bundle.registration || undefined
  const personal = bundle.personal || undefined
  const employment = bundle.employment || undefined
  const documents = bundle.documents || undefined
  const verification = bundle.verification || undefined

  const registrationId =
    registration?.registration_id ||
    personal?.registration_id ||
    employment?.registration_id ||
    documents?.registration_id ||
    verification?.registration_id ||
    ""

  if (!registrationId) {
    return null
  }

  const firstName = personal?.first_name || personal?.firstname || verification?.first_name || verification?.firstname || ""
  const surname = personal?.surname || verification?.surname || ""
  const fullName = `${surname} ${firstName}`.trim() || "Applicant"

  const department = employment?.department || personal?.department || "N/A"
  const position =
    employment?.position ||
    employment?.rank_position ||
    employment?.grade_level ||
    personal?.position ||
    "N/A"

  const status =
    registration?.status ||
    documents?.status ||
    personal?.status ||
    employment?.status ||
    verification?.status ||
    "pending_approval"

  return {
    fullName,
    registrationId,
    email: personal?.email || verification?.email || "N/A",
    department,
    position,
    status,
    source: "registration",
    submittedDate: registration?.submitted_at || registration?.created_at || documents?.upload_date || "N/A",
    createdAt: registration?.created_at || personal?.created_at || documents?.created_at || "N/A",
    updatedAt: registration?.updated_at || personal?.updated_at || documents?.updated_at || "N/A",
    recordType,
  }
}

const buildSearchResultFromPayload = (payload: Record<string, unknown>): SearchResult | null => {
  const nestedData = payload.data

  if (nestedData && typeof nestedData === "object" && !Array.isArray(nestedData)) {
    const nested = nestedData as Record<string, unknown>
    const bundleCandidate = nested as unknown
    if (isTrackBundle(bundleCandidate) && nested.registration) {
      const bundle = nested as unknown as TrackRegistrationBundle
      return buildSearchResultFromBundle(bundle, (payload.type as string | undefined) || "registration")
    }

    if (isTrackRecord(nested)) {
      return buildSearchResultFromRecord(
        {
          ...nested,
          status:
            (nested.status as string | undefined) ||
            (payload.status as string | undefined) ||
            "pending_approval",
        } as Parameters<typeof buildSearchResultFromRecord>[0],
        (payload.type as string | undefined) || "application",
      )
    }

    if ("registration" in nested && nested.registration && typeof nested.registration === "object") {
      return buildSearchResultFromBundle(
        nested as unknown as TrackRegistrationBundle,
        (payload.type as string | undefined) || "registration",
      )
    }
  }

  if ("registration" in payload && payload.registration && typeof payload.registration === "object") {
    return buildSearchResultFromBundle(
      payload as unknown as TrackRegistrationBundle,
      (payload.type as string | undefined) || "registration",
    )
  }

  if (isTrackRecord(payload.data)) {
    return buildSearchResultFromRecord(
      {
        ...payload.data,
        status:
          (payload.data.status as string | undefined) ||
          (payload.status as string | undefined) ||
          "pending_approval",
      } as Parameters<typeof buildSearchResultFromRecord>[0],
      (payload.type as string | undefined) || "application",
    )
  }

  if (isTrackRecord(payload.record)) {
    return buildSearchResultFromRecord(payload.record, (payload.type as string | undefined) || "application")
  }

  if (isTrackRecord(payload.employee)) {
    return buildSearchResultFromRecord(payload.employee, (payload.type as string | undefined) || "employee")
  }

  if (isTrackRecord(payload.application)) {
    return buildSearchResultFromRecord(payload.application, (payload.type as string | undefined) || "application")
  }

  if (isTrackRecord(payload.result)) {
    return buildSearchResultFromRecord(payload.result, (payload.type as string | undefined) || "application")
  }

  return null
}

const buildSearchResultFromRecord = (
  record: {
    registration_id?: string | null
    surname?: string | null
    firstname?: string | null
    email?: string | null
    department?: string | null
    position?: string | null
    status?: string | null
    source?: string | null
    submission_date?: string | null
    created_at?: string | null
    updated_at?: string | null
    name?: string | null
  },
  recordType: string,
): SearchResult | null => {
  const registrationId = record.registration_id || ""
  if (!registrationId) {
    return null
  }

  const nameParts = (record.name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  const fallbackFirstName = nameParts.slice(1).join(" ") || nameParts[0] || "Applicant"
  const fallbackSurname = nameParts[0] || ""
  const fullName = `${record.surname || fallbackSurname} ${record.firstname || fallbackFirstName}`.trim() || "Applicant"

  return {
    fullName,
    registrationId,
    email: record.email || "N/A",
    department: record.department || "N/A",
    position: record.position || "N/A",
    status: record.status || "pending_approval",
    source: record.source || "N/A",
    submittedDate: record.submission_date || record.created_at || "N/A",
    createdAt: record.created_at || "N/A",
    updatedAt: record.updated_at || "N/A",
    recordType,
  }
}

const buildTrackSearchUrls = (method: "id" | "email", value: string) => {
  if (method === "email") {
    const encodedEmail = encodeURIComponent(value.toLowerCase())
    return [`/api/track?email=${encodedEmail}`]
  }

  const normalizedVariants = buildRegistrationIdVariants(value)

  return normalizedVariants.flatMap((variant) => {
    const encoded = encodeURIComponent(variant)
    return [
      `/api/track?id=${encoded}`,
      `/api/track?registration_id=${encoded}`,
      `/api/track?registrationId=${encoded}`,
    ]
  })
}

const fetchPendingEmployeeFallback = async (method: "id" | "email", value: string) => {
  const response = await fetch(`/api/admin/pending?page=1&limit=1000`, {
    cache: "no-store",
  })

  const payload = await response.json().catch(() => null)
  const employees: PendingEmployeeRecord[] =
    Array.isArray(payload?.data?.employees) ? payload.data.employees : []

  const normalized = value.trim().toLowerCase()
  const matched = employees.find((employee) => {
    const regId = String(employee.registration_id || "").trim().toLowerCase()
    const email = String(employee.email || "").trim().toLowerCase()

    if (method === "email") {
      return email === normalized
    }

    const normalizedReg = normalized.replace(/[\s-]+/g, "")
    const regIdCompact = regId.replace(/[\s-]+/g, "")
    const regIdSpaced = regId.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim()
    const normalizedSpaced = normalized.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim()
    return (
      regId === normalized ||
      regIdCompact === normalizedReg ||
      regIdSpaced === normalizedSpaced
    )
  })

  return matched
}

export default function TrackApplicationPage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const initialId = searchParams.get("id") ?? ""
  const searchRequestIdRef = useRef(0)

  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchMethod, setSearchMethod] = useState<"id" | "email">("id")
  const [searchValue, setSearchValue] = useState(initialId)
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)

  const executeSearch = async (rawValue?: string, method?: "id" | "email") => {
    const value = normalizeSearchValue(rawValue ?? searchValue)
    const activeMethod = method ?? searchMethod
    const requestId = searchRequestIdRef.current + 1
    searchRequestIdRef.current = requestId

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
        const payload = rawPayload as Record<string, unknown> | null

        if (requestId !== searchRequestIdRef.current) {
          return
        }

        if (!res.ok) {
          lastError =
            (typeof payload?.message === "string" ? payload.message : null) ||
            `Request failed (${res.status})`
          continue
        }

        if (payload) {
          foundResult = buildSearchResultFromPayload(payload)
          if (foundResult) break
        }

        lastError = typeof payload?.message === "string" ? payload.message : "Application not found"
      }

      if (!foundResult) {
        const fallbackMatch = await fetchPendingEmployeeFallback(activeMethod, value)
        if (fallbackMatch) {
          foundResult = buildSearchResultFromRecord(fallbackMatch, "pending_employee")
        }
      }

      if (!foundResult) {
        // Last chance: if the exact backend track route is unavailable, try the
        // pending list with the opposite key mode so IDs/emails that were stored
        // differently still surface a result.
        const alternateMethod = activeMethod === "id" ? "email" : "id"
        const fallbackMatch = await fetchPendingEmployeeFallback(alternateMethod, value)
        if (fallbackMatch) {
          foundResult = buildSearchResultFromRecord(fallbackMatch, "pending_employee")
        }
      }

      if (!foundResult) {
        throw new Error(lastError || "Application not found")
      }

      if (requestId !== searchRequestIdRef.current) {
        return
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_38%),linear-gradient(to_bottom,_#fff7f7,_#ffffff_36%,_#f8fafc_100%)] py-10 px-4 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-center">
          <Link href="/" className="flex items-center gap-3 rounded-full bg-white/80 px-4 py-2 shadow-sm ring-1 ring-slate-200 backdrop-blur">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Coat_of_arms_of_Nigeria.svg-IFrFqiae8fXtNsVx4Ip0AeHFPjj7Mp.png"
              width={40}
              height={40}
              alt="Coat of Arms of Nigeria"
              className="h-10 w-auto"
            />
            <span className="text-lg font-semibold tracking-[0.28em] text-slate-900">IPPIS</span>
          </Link>
        </div>

        <Card className="overflow-hidden border border-rose-100/80 bg-white/90 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur">
          <CardHeader className="space-y-4 pb-6">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
              Onboarding status check
            </div>
            <CardTitle className="text-center text-3xl font-semibold tracking-tight text-slate-950">
              Track Your Application
            </CardTitle>
            <CardDescription className="mx-auto max-w-xl text-center text-sm text-slate-600">
              Enter your registration ID or email to check your onboarding status.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
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
              <TabsList className="mx-auto grid w-full max-w-md grid-cols-2 gap-1 rounded-full border border-emerald-100 bg-slate-50 p-1.5 shadow-sm">
                <TabsTrigger
                  value="id"
                  className="rounded-full border border-transparent bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:border-emerald-200 hover:bg-emerald-50 data-[state=active]:border-emerald-600 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  Search by ID
                </TabsTrigger>
                <TabsTrigger
                  value="email"
                  className="rounded-full border border-transparent bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:border-emerald-200 hover:bg-emerald-50 data-[state=active]:border-emerald-600 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  Search by Email
                </TabsTrigger>
              </TabsList>

              <TabsContent value="id" className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="registration-id" className="text-sm font-medium text-slate-700">
                    Registration ID
                  </Label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Input
                      id="registration-id"
                      placeholder="e.g. IPPIS 010"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="h-11 border-slate-300 bg-white/90 shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500 sm:flex-1"
                    />
                    <Button
                      onClick={() => void executeSearch(searchValue, "id")}
                      disabled={isLoading || searchValue.trim() === ""}
                      className="h-11 whitespace-nowrap bg-emerald-600 px-5 font-semibold shadow-sm hover:bg-emerald-700"
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

              <TabsContent value="email" className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email Address
                  </Label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g. user@example.com"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="h-11 border-slate-300 bg-white/90 shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500 sm:flex-1"
                    />
                    <Button
                      onClick={() => void executeSearch(searchValue, "email")}
                      disabled={isLoading || searchValue.trim() === ""}
                      className="h-11 whitespace-nowrap bg-emerald-600 px-5 font-semibold shadow-sm hover:bg-emerald-700"
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
              <div className="space-y-6">
                <div className="rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-emerald-50/60 p-6 shadow-sm">
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.32em] text-slate-400">{searchResult.recordType}</p>
                      <h3 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{searchResult.fullName}</h3>
                      <p className="mt-1 text-sm text-slate-500">ID: {searchResult.registrationId}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {statusBadge}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {summaryCards.map((card) => {
                      const Icon = card.icon
                      return (
                        <div
                          key={card.label}
                          className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                            <Icon className="h-4 w-4" />
                          </div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">{card.label}</p>
                          <p className="mt-1 break-words text-sm font-semibold text-slate-900">{card.value}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Card className="border-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/60 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-slate-950">Application Details</CardTitle>
                      <CardDescription className="text-sm text-slate-600">
                        Live information returned from the onboarding API.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Email</p>
                        <p className="mt-1 break-words text-sm text-slate-900">{searchResult.email}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Department</p>
                        <p className="mt-1 break-words text-sm text-slate-900">{searchResult.department}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Position</p>
                        <p className="mt-1 break-words text-sm text-slate-900">{searchResult.position}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Source</p>
                        <p className="mt-1 break-words text-sm text-slate-900">{searchResult.source}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/60 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-slate-950">Timeline</CardTitle>
                      <CardDescription className="text-sm text-slate-600">
                        Track submission and update timestamps.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Submitted</p>
                        <p className="mt-1 text-sm text-slate-900">{formatDate(searchResult.submittedDate)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Created</p>
                        <p className="mt-1 text-sm text-slate-900">{formatDate(searchResult.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Last Updated</p>
                        <p className="mt-1 text-sm text-slate-900">{formatDate(searchResult.updatedAt)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4 text-sm text-amber-900 shadow-sm">
                  If you have any questions or need further assistance, please contact the IPPIS support team.
                </div>
              </div>
            )}

            {!searchResult && !isLoading && hasSearched && (
              <div className="mt-8 rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-3 text-center text-sm text-rose-700">
                No application found matching your search.
              </div>
            )}
          </CardContent>

          <CardFooter className="justify-center border-t border-slate-100 bg-slate-50/40 py-5">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 underline-offset-4 transition hover:text-slate-950 hover:underline">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
