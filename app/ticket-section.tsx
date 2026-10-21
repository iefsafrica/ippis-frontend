"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Ticket,
  Search,
  PlusCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Send,
  ArrowRight,
  ShieldCheck,
  User,
  Mail,
  Building2,
  Calendar,
  Loader2,
  Copy,
  ExternalLink,
  MessageSquare,
  FileCheck2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { SUPPORT_TICKET_MOCKS } from "@/app/admin/support-tickets/data/mock-tickets"
import { getSupportTicket, createSupportTicket } from "@/services/endpoints/supportTickets/supportTickets"
import type { SupportTicket } from "@/types/supportTickets"

const STATUS_COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  Open: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  "In Progress": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "On Hold": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  Resolved: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  Closed: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" },
}

const PRIORITY_COLOR_MAP: Record<string, string> = {
  Low: "bg-slate-100 text-slate-700",
  Medium: "bg-amber-100 text-amber-800",
  High: "bg-orange-100 text-orange-800",
  Critical: "bg-rose-100 text-rose-800",
}

export default function TicketSection() {
  const [activeTab, setActiveTab] = useState<"track" | "submit" | "faq">("track")
  const [searchTicketId, setSearchTicketId] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchedTicket, setSearchedTicket] = useState<SupportTicket | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState(false)

  // Ticket creation state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdTicketResult, setCreatedTicketResult] = useState<SupportTicket | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    ippisNumber: "",
    department: "IT Support",
    category: "Payroll & Deductions",
    priority: "Medium",
    subject: "",
    description: "",
  })

  // Handle tracking search
  const handleTrackSearch = async (ticketIdToSearch?: string) => {
    const query = (ticketIdToSearch || searchTicketId).trim()
    if (!query) {
      setSearchError("Please enter a valid Ticket ID.")
      return
    }

    setIsSearching(true)
    setSearchError(null)
    setSearchedTicket(null)

    try {
      // First attempt backend API
      try {
        const response = await getSupportTicket(query)
        if (response?.data?.tickets && response.data.tickets.length > 0) {
          const match = response.data.tickets.find(
            (t) => t.ticket_id.toLowerCase() === query.toLowerCase() || String(t.id) === query
          ) || response.data.tickets[0]
          setSearchedTicket(match)
          setIsSearching(false)
          return
        }
      } catch {
        // Fall back to client mocks or local session
      }

      // Check local storage / session storage for recently created tickets
      if (typeof window !== "undefined") {
        const localTicketsRaw = window.localStorage.getItem("ippis_recent_tickets") || window.sessionStorage.getItem("ippis_recent_tickets")
        if (localTicketsRaw) {
          try {
            const localTickets: SupportTicket[] = JSON.parse(localTicketsRaw)
            const localMatch = localTickets.find(
              (t) => t.ticket_id.toLowerCase() === query.toLowerCase() || String(t.id) === query
            )
            if (localMatch) {
              setSearchedTicket(localMatch)
              setIsSearching(false)
              return
            }
          } catch {
            // Ignore parse error
          }
        }
      }

      // Check built-in mock tickets
      const mockMatch = SUPPORT_TICKET_MOCKS.find(
        (t) =>
          t.ticket_id.toLowerCase() === query.toLowerCase() ||
          String(t.id) === query ||
          t.ticket_id.toLowerCase().replace(/[^a-z0-9]/g, "") === query.toLowerCase().replace(/[^a-z0-9]/g, "")
      )

      if (mockMatch) {
        setSearchedTicket(mockMatch)
      } else {
        setSearchError(`No support ticket found matching "${query}". Please verify the Ticket Reference ID.`)
      }
    } catch {
      setSearchError("Failed to retrieve ticket status. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  // Handle submitting new ticket
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.description.trim()) {
      toast.error("Please fill in all required fields.")
      return
    }

    setIsSubmitting(true)
    const generatedTicketId = `TICKET-${Math.floor(1000 + Math.random() * 9000)}`
    const nowIso = new Date().toISOString()

    const newTicketObj: SupportTicket = {
      id: Date.now(),
      ticket_id: generatedTicketId,
      subject: formData.subject,
      description: formData.description,
      department: formData.department,
      priority: formData.priority,
      status: "Open",
      assigned_to: "Help Desk Triage",
      attachment: null,
      created_at: nowIso,
      updated_at: nowIso,
      created_by: `${formData.name} (${formData.email})`,
      due_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      progress: 10,
    }

    try {
      try {
        await createSupportTicket({
          subject: formData.subject,
          description: `[Submitter: ${formData.name} | ${formData.email} | IPPIS: ${formData.ippisNumber || "N/A"} | Category: ${formData.category}]\n\n${formData.description}`,
          department: formData.department,
          priority: formData.priority.toLowerCase(),
          due_date: newTicketObj.due_date,
          progress: 10,
        })
      } catch {
        // Fallback gracefully if API endpoint is unavailable
      }

      // Save to localStorage and sessionStorage so it can be tracked immediately and viewed in admin
      if (typeof window !== "undefined") {
        try {
          const existingRaw = window.localStorage.getItem("ippis_recent_tickets") || window.sessionStorage.getItem("ippis_recent_tickets")
          const existing = existingRaw ? JSON.parse(existingRaw) : []
          existing.unshift(newTicketObj)
          window.localStorage.setItem("ippis_recent_tickets", JSON.stringify(existing))
          window.sessionStorage.setItem("ippis_recent_tickets", JSON.stringify(existing))
        } catch {
          // Ignore storage quota
        }
      }

      setCreatedTicketResult(newTicketObj)
      toast.success(`Support Ticket ${generatedTicketId} submitted successfully!`)
      setFormData({
        name: "",
        email: "",
        ippisNumber: "",
        department: "IT Support",
        category: "Payroll & Deductions",
        priority: "Medium",
        subject: "",
        description: "",
      })
    } catch {
      toast.error("Error creating ticket. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyTicketId = (id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(id)
      setCopiedId(true)
      toast.success("Ticket ID copied to clipboard")
      setTimeout(() => setCopiedId(false), 2000)
    }
  }

  return (
    <section id="tickets" className="w-full py-12 md:py-20 lg:py-24 bg-gradient-to-b from-white via-slate-50 to-white">
      <div className="container px-4 md:px-6">
        {/* Section Heading */}
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3.5 py-1 text-sm font-semibold text-green-800 shadow-sm">
            <Ticket className="h-4 w-4 text-green-700" />
            <span>Support & Help Desk</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-gray-900">
            Submit & Track Support Tickets
          </h2>
          <p className="max-w-[800px] text-gray-600 md:text-lg">
            Have an issue with your payroll, biometric verification, login access, or document record? Submit a support ticket or track your resolution status in real time.
          </p>
        </div>

        {/* Interactive Tabs Card */}
        <div className="mx-auto max-w-4xl">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as "track" | "submit" | "faq")}
            className="w-full"
          >
            <div className="flex justify-center mb-8">
              <TabsList className="grid w-full max-w-md grid-cols-3 bg-gray-100 p-1 rounded-xl shadow-inner">
                <TabsTrigger
                  value="track"
                  className="rounded-lg py-2.5 font-medium data-[state=active]:bg-white data-[state=active]:text-green-800 data-[state=active]:shadow-sm transition-all"
                >
                  <Search className="h-4 w-4 mr-1.5 hidden sm:inline" />
                  Track Ticket
                </TabsTrigger>
                <TabsTrigger
                  value="submit"
                  className="rounded-lg py-2.5 font-medium data-[state=active]:bg-white data-[state=active]:text-green-800 data-[state=active]:shadow-sm transition-all"
                >
                  <PlusCircle className="h-4 w-4 mr-1.5 hidden sm:inline" />
                  Submit Ticket
                </TabsTrigger>
                <TabsTrigger
                  value="faq"
                  className="rounded-lg py-2.5 font-medium data-[state=active]:bg-white data-[state=active]:text-green-800 data-[state=active]:shadow-sm transition-all"
                >
                  <HelpCircle className="h-4 w-4 mr-1.5 hidden sm:inline" />
                  Help Guide
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: TRACK TICKET */}
            <TabsContent value="track" className="space-y-6 focus-visible:outline-none">
              <Card className="border border-gray-200/80 shadow-md overflow-hidden bg-white">
                <CardHeader className="bg-gradient-to-r from-green-50/60 to-emerald-50/30 border-b border-gray-100 pb-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Search className="h-5 w-5 text-green-700" />
                        Track Your Support Request
                      </CardTitle>
                      <CardDescription className="text-gray-600 mt-1">
                        Enter your Support Ticket Reference ID to check real-time resolution progress and department notes.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {/* Search Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleTrackSearch()
                    }}
                    className="flex flex-col sm:flex-row gap-3"
                  >
                    <div className="relative flex-1">
                      <Input
                        type="text"
                        placeholder="Enter Ticket ID (e.g. TICKET-1001 or TICKET-1002)"
                        value={searchTicketId}
                        onChange={(e) => setSearchTicketId(e.target.value)}
                        className="h-12 pl-4 pr-10 text-base border-gray-300 focus-visible:ring-green-600"
                      />
                      {searchTicketId && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchTicketId("")
                            setSearchedTicket(null)
                            setSearchError(null)
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={isSearching}
                      className="h-12 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center justify-center gap-2 shadow-sm"
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Searching...</span>
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4" />
                          <span>Track Status</span>
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Quick sample pills */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                    <span className="font-semibold text-gray-700">Quick samples:</span>
                    {["TICKET-1001", "TICKET-1002", "TICKET-1003"].map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          setSearchTicketId(id)
                          handleTrackSearch(id)
                        }}
                        className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 hover:bg-green-100 hover:text-green-800 text-slate-700 transition-colors border border-slate-200"
                      >
                        {id}
                      </button>
                    ))}
                  </div>

                  {/* Error display */}
                  {searchError && (
                    <div className="mt-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold">Ticket Not Found</p>
                        <p className="mt-0.5 text-red-700">{searchError}</p>
                        <div className="mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveTab("submit")}
                            className="bg-white text-red-800 border-red-300 hover:bg-red-50"
                          >
                            Submit a New Ticket Instead
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Ticket Details Result Card */}
                  {searchedTicket && (
                    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm animate-in fade-in-50 duration-300">
                      {/* Ticket Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-2.5">
                          <div className="h-10 w-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center font-bold">
                            <Ticket className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-gray-900 tracking-tight">
                                {searchedTicket.ticket_id}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyTicketId(searchedTicket.ticket_id)}
                                title="Copy ID"
                                className="text-gray-400 hover:text-gray-700 p-1"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                              {copiedId && <span className="text-xs text-green-600 font-medium">Copied!</span>}
                            </div>
                            <p className="text-xs text-gray-500">
                              Logged on {new Date(searchedTicket.created_at).toLocaleDateString("en-NG", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                              STATUS_COLOR_MAP[searchedTicket.status]?.bg || "bg-gray-100"
                            } ${STATUS_COLOR_MAP[searchedTicket.status]?.text || "text-gray-800"} ${
                              STATUS_COLOR_MAP[searchedTicket.status]?.border || "border-gray-200"
                            }`}
                          >
                            {searchedTicket.status}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              PRIORITY_COLOR_MAP[searchedTicket.priority] || "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {searchedTicket.priority} Priority
                          </span>
                        </div>
                      </div>

                      {/* Ticket Body Details */}
                      <div className="mt-5 space-y-4">
                        <div>
                          <h4 className="text-base font-semibold text-gray-900">{searchedTicket.subject}</h4>
                          <p className="mt-1 text-sm text-gray-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                            {searchedTicket.description}
                          </p>
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                          <div className="bg-white p-3 rounded-lg border border-gray-100">
                            <span className="text-gray-500 block">Department / MDA</span>
                            <span className="font-semibold text-gray-800 flex items-center gap-1.5 mt-1">
                              <Building2 className="h-3.5 w-3.5 text-gray-400" />
                              {searchedTicket.department}
                            </span>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-gray-100">
                            <span className="text-gray-500 block">Assigned Officer</span>
                            <span className="font-semibold text-gray-800 flex items-center gap-1.5 mt-1">
                              <User className="h-3.5 w-3.5 text-gray-400" />
                              {searchedTicket.assigned_to || "Pending Assignment"}
                            </span>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-gray-100">
                            <span className="text-gray-500 block">Target SLA Due</span>
                            <span className="font-semibold text-gray-800 flex items-center gap-1.5 mt-1">
                              <Clock className="h-3.5 w-3.5 text-gray-400" />
                              {searchedTicket.due_date
                                ? new Date(searchedTicket.due_date).toLocaleDateString("en-NG", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "Within 48 hours"}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar & Milestones */}
                        <div className="pt-2">
                          <div className="flex justify-between items-center text-xs font-semibold text-gray-700 mb-1.5">
                            <span>Resolution Progress</span>
                            <span>{searchedTicket.progress ?? (searchedTicket.status === "Closed" ? 100 : searchedTicket.status === "In Progress" ? 50 : 20)}%</span>
                          </div>
                          <Progress
                            value={searchedTicket.progress ?? (searchedTicket.status === "Closed" ? 100 : searchedTicket.status === "In Progress" ? 50 : 20)}
                            className="h-2.5 bg-gray-100"
                          />
                        </div>

                        {/* Step Timeline */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-xs font-semibold text-gray-700 mb-3">Resolution Timeline</p>
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                              <span>1. Logged</span>
                            </div>
                            <div
                              className={`flex items-center gap-2 p-2 rounded-lg border ${
                                (searchedTicket.progress ?? 0) >= 30 || searchedTicket.status !== "Open"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                                  : "bg-slate-50 text-slate-500 border-slate-100"
                              }`}
                            >
                              <CheckCircle2
                                className={`h-4 w-4 flex-shrink-0 ${
                                  (searchedTicket.progress ?? 0) >= 30 || searchedTicket.status !== "Open"
                                    ? "text-emerald-600"
                                    : "text-slate-300"
                                }`}
                              />
                              <span>2. Department Triage</span>
                            </div>
                            <div
                              className={`flex items-center gap-2 p-2 rounded-lg border ${
                                (searchedTicket.progress ?? 0) >= 60 || searchedTicket.status === "In Progress" || searchedTicket.status === "Resolved"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                                  : "bg-slate-50 text-slate-500 border-slate-100"
                              }`}
                            >
                              <CheckCircle2
                                className={`h-4 w-4 flex-shrink-0 ${
                                  (searchedTicket.progress ?? 0) >= 60 || searchedTicket.status === "In Progress" || searchedTicket.status === "Resolved"
                                    ? "text-emerald-600"
                                    : "text-slate-300"
                                }`}
                              />
                              <span>3. Investigation</span>
                            </div>
                            <div
                              className={`flex items-center gap-2 p-2 rounded-lg border ${
                                searchedTicket.status === "Resolved" || searchedTicket.status === "Closed"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                                  : "bg-slate-50 text-slate-500 border-slate-100"
                              }`}
                            >
                              <CheckCircle2
                                className={`h-4 w-4 flex-shrink-0 ${
                                  searchedTicket.status === "Resolved" || searchedTicket.status === "Closed"
                                    ? "text-emerald-600"
                                    : "text-slate-300"
                                }`}
                              />
                              <span>4. Resolved</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Escalation Footer */}
                      <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
                        <span>Need urgent escalation on this ticket?</span>
                        <div className="flex items-center gap-3">
                          <a
                            href="tel:+234700477474357"
                            className="font-semibold text-green-700 hover:text-green-800 underline flex items-center gap-1"
                          >
                            Call Help Desk
                          </a>
                          <span>•</span>
                          <a
                            href="mailto:helpdesk@ippis.gov.ng?subject=Escalation%20Ticket%20"
                            className="font-semibold text-green-700 hover:text-green-800 underline flex items-center gap-1"
                          >
                            Email Escalations
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: SUBMIT TICKET */}
            <TabsContent value="submit" className="space-y-6 focus-visible:outline-none">
              <Card className="border border-gray-200/80 shadow-md bg-white">
                <CardHeader className="bg-gradient-to-r from-green-50/60 to-emerald-50/30 border-b border-gray-100 pb-5">
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <PlusCircle className="h-5 w-5 text-green-700" />
                    Open a Support Ticket
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                    Fill out the form below. Your ticket will be assigned directly to the appropriate department specialist.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {/* Created confirmation banner if just submitted */}
                  {createdTicketResult && (
                    <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-5 animate-in fade-in duration-300">
                      <div className="flex items-start gap-3">
                        <FileCheck2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-base font-bold text-green-900">
                            Ticket Submitted Successfully!
                          </h4>
                          <p className="text-sm text-green-800 mt-1">
                            Your support ticket reference is{" "}
                            <span className="font-mono font-bold bg-green-100 px-2 py-0.5 rounded text-green-900">
                              {createdTicketResult.ticket_id}
                            </span>
                            . Please save this reference for tracking.
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSearchTicketId(createdTicketResult.ticket_id)
                                handleTrackSearch(createdTicketResult.ticket_id)
                                setActiveTab("track")
                              }}
                              className="bg-green-700 hover:bg-green-800 text-white font-medium"
                            >
                              Track This Ticket Now
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyTicketId(createdTicketResult.ticket_id)}
                              className="border-green-300 text-green-800 hover:bg-green-100/60"
                            >
                              <Copy className="h-3.5 w-3.5 mr-1.5" />
                              Copy Ticket ID
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setCreatedTicketResult(null)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Submit Another
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmitTicket} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                          Full Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          placeholder="e.g. Ibrahim Abubakar"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="h-11 border-gray-300 focus-visible:ring-green-600"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                          Official or Contact Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="e.g. employee@mda.gov.ng"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="h-11 border-gray-300 focus-visible:ring-green-600"
                        />
                      </div>

                      {/* IPPIS / Staff Number */}
                      <div className="space-y-1.5">
                        <Label htmlFor="ippisNumber" className="text-sm font-semibold text-gray-700">
                          IPPIS Number / Staff ID <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                        </Label>
                        <Input
                          id="ippisNumber"
                          placeholder="e.g. IPPIS-123456"
                          value={formData.ippisNumber}
                          onChange={(e) => setFormData({ ...formData, ippisNumber: e.target.value })}
                          className="h-11 border-gray-300 focus-visible:ring-green-600"
                        />
                      </div>

                      {/* Department / MDA */}
                      <div className="space-y-1.5">
                        <Label htmlFor="department" className="text-sm font-semibold text-gray-700">
                          Department / Target Agency <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.department}
                          onValueChange={(val) => setFormData({ ...formData, department: val })}
                        >
                          <SelectTrigger id="department" className="h-11 border-gray-300">
                            <SelectValue placeholder="Select Department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IT Support">IT Support & System Access</SelectItem>
                            <SelectItem value="Payroll">Payroll & Deductions</SelectItem>
                            <SelectItem value="HR">HR & Personnel Services</SelectItem>
                            <SelectItem value="Finance">Finance & Remittance</SelectItem>
                            <SelectItem value="Biometrics">Biometric & Verification</SelectItem>
                            <SelectItem value="Pensions">Pensions & Gratuity</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Category */}
                      <div className="space-y-1.5">
                        <Label htmlFor="category" className="text-sm font-semibold text-gray-700">
                          Issue Category
                        </Label>
                        <Select
                          value={formData.category}
                          onValueChange={(val) => setFormData({ ...formData, category: val })}
                        >
                          <SelectTrigger id="category" className="h-11 border-gray-300">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Payroll & Deductions">Payroll & Deductions Issue</SelectItem>
                            <SelectItem value="Biometric Capture">Biometric Capture / NIN Issue</SelectItem>
                            <SelectItem value="Portal Access">Login & Portal Credentials</SelectItem>
                            <SelectItem value="Document Verification">Document & Record Upload</SelectItem>
                            <SelectItem value="Bank Account Update">Bank Account & BVN Update</SelectItem>
                            <SelectItem value="General Assistance">General Assistance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Priority */}
                      <div className="space-y-1.5">
                        <Label htmlFor="priority" className="text-sm font-semibold text-gray-700">
                          Urgency / Priority Level
                        </Label>
                        <Select
                          value={formData.priority}
                          onValueChange={(val) => setFormData({ ...formData, priority: val })}
                        >
                          <SelectTrigger id="priority" className="h-11 border-gray-300">
                            <SelectValue placeholder="Select Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low - General inquiry</SelectItem>
                            <SelectItem value="Medium">Medium - Standard request (48 hrs)</SelectItem>
                            <SelectItem value="High">High - Salary or payroll block (24 hrs)</SelectItem>
                            <SelectItem value="Critical">Critical - Urgent escalation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="space-y-1.5 pt-1">
                      <Label htmlFor="subject" className="text-sm font-semibold text-gray-700">
                        Ticket Subject / Summary <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="subject"
                        placeholder="Brief summary of the issue (e.g. Unable to view March payslip in portal)"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                        className="h-11 border-gray-300 focus-visible:ring-green-600"
                      />
                    </div>

                    {/* Detailed Description */}
                    <div className="space-y-1.5 pt-1">
                      <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                        Detailed Description & Evidence <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Please describe the issue in detail, including error messages, affected month/period, and any actions already taken..."
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        className="border-gray-300 focus-visible:ring-green-600"
                      />
                    </div>

                    {/* Notice */}
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 text-xs text-gray-600 border border-slate-200">
                      <ShieldCheck className="h-4 w-4 text-green-700 flex-shrink-0" />
                      <span>
                        All ticket submissions are encrypted and handled directly by authorized IPPIS Desk Officers. Never share your bank passwords or OTPs in support requests.
                      </span>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold text-base flex items-center justify-center gap-2 shadow-sm transition-all"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Submitting Ticket...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            <span>Submit Support Ticket</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: HELP GUIDE & SLA */}
            <TabsContent value="faq" className="space-y-6 focus-visible:outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border border-gray-200 shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-green-700" />
                      Standard Ticket Resolution SLAs
                    </CardTitle>
                    <CardDescription>
                      Expected response times by category once your ticket is logged.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div>
                        <span className="font-semibold text-sm text-gray-800 block">Payroll / Salary Discrepancies</span>
                        <span className="text-xs text-gray-500">Requires MDA payroll verification</span>
                      </div>
                      <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 font-semibold">
                        24 - 48 Hours
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div>
                        <span className="font-semibold text-sm text-gray-800 block">Portal Login & Credentials</span>
                        <span className="text-xs text-gray-500">Password reset and 2FA lockout</span>
                      </div>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold">
                        Instant - 4 Hours
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div>
                        <span className="font-semibold text-sm text-gray-800 block">Biometric & NIN Verification</span>
                        <span className="text-xs text-gray-500">Data alignment with NIMC database</span>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 font-semibold">
                        1 - 2 Business Days
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div>
                        <span className="font-semibold text-sm text-gray-800 block">Bank Account & Name Change</span>
                        <span className="text-xs text-gray-500">Requires formal MDA letter and BVN audit</span>
                      </div>
                      <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200 font-semibold">
                        3 - 5 Business Days
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-green-700" />
                      Direct Help Desk Channels
                    </CardTitle>
                    <CardDescription>
                      Reach our support officers directly for emergency or expedited escalations.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-xl bg-green-50/70 border border-green-100 space-y-2">
                      <div className="flex items-center gap-2 text-green-900 font-bold text-sm">
                        <MessageSquare className="h-4 w-4 text-green-700" />
                        Toll-Free Support Line
                      </div>
                      <p className="text-lg font-mono font-bold text-green-800">
                        +234 (0) 700-IPPIS-HELP
                      </p>
                      <p className="text-xs text-green-700">
                        Available Monday to Friday, 8:00 AM – 5:00 PM (WAT)
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                        <Mail className="h-4 w-4 text-gray-600" />
                        Help Desk Email
                      </div>
                      <p className="text-sm font-mono text-gray-800">
                        helpdesk@ippis.gov.ng
                      </p>
                      <p className="text-xs text-gray-500">
                        Include your IPPIS reference or Ticket ID in the email subject.
                      </p>
                    </div>

                    <div className="pt-2 flex justify-center">
                      <Button
                        onClick={() => setActiveTab("submit")}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Open a Support Ticket Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}
