"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Megaphone,
  Search,
  CalendarDays,
  FileText,
  Printer,
  ArrowRight,
  ChevronRight,
  Home,
  BookOpen,
  Ticket,
} from "lucide-react"
import { getAnnouncements } from "@/services/endpoints/organizations/announcement/announcement"
import type { Announcement } from "@/types/organizations/announcement/announcement-management"

interface DisplayAnnouncement {
  id: string | number
  title: string
  content: string
  summary: string
  category: "Circular" | "Notice" | "Payroll" | "System Update"
  refNumber?: string
  date: string
  author: string
}

const FALLBACK_ANNOUNCEMENTS: DisplayAnnouncement[] = [
  {
    id: "ann-01",
    title: "Mandatory IPPIS Personnel Physical Verification & Biometric Re-Validation Exercise 2026",
    summary:
      "All federal employees across Ministries, Departments, and Agencies (MDAs) are notified of the upcoming biometric capture and nominal roll audit schedule.",
    content: `
### FEDERAL REPUBLIC OF NIGERIA
**Office of the Head of the Civil Service of the Federation (OHCSF)**
**Circular Ref:** OHCSF/IPPIS/CIR/2026/VOL.IV/118
**Date:** October 15, 2026

#### 1.0 Objective
In alignment with the Federal Government's public service reform agenda, notice is hereby given of the **Mandatory IPPIS Physical Biometric Re-Validation Exercise**. This exercise aims to clean up the federal nominal roll, eliminate ghost worker occurrences, and synchronize civil service records with the National Identity Management Commission (NIMC).

#### 2.0 Scope & Venue
The verification exercise will be conducted in phases across the six geopolitical zones and the Federal Capital Territory (FCT). Verification centers have been established at Federal Secretariats and designated state liaison offices.

#### 3.0 Mandatory Required Documentation
Every federal officer is required to report in person with originals and certified true copies of:
- First Appointment Letter and Confirmation of Appointment Letter
- Last Promotion Letter or Gazette entry
- Valid National Identity Number (NIN) Slip
- Highest Academic and Professional Certificates
- Official MDA Staff Identity Card
- Bank Statement containing salary history for the preceding 6 months

#### 4.0 Compliance Deadline
Officers who fail to participate within their scheduled MDA window will have their monthly salary disbursements suspended on the IPPIS ledger until comprehensive biometric validation is completed.
    `,
    category: "Circular",
    refNumber: "OHCSF/IPPIS/CIR/2026/VOL.IV/118",
    date: "October 15, 2026",
    author: "Office of the Head of the Civil Service of the Federation",
  },
  {
    id: "ann-02",
    title: "Monthly Payroll Processing Cut-Off Dates & Nominal Roll Submission Schedule",
    summary:
      "The Office of the Accountant-General issues crucial timelines for MDA desk officers regarding variance uploads, allowance inputs, and monthly payroll sign-offs.",
    content: `
### FEDERAL REPUBLIC OF NIGERIA
**Office of the Accountant-General of the Federation (OAGF)**
**Treasury Operations Circular:** OAGF/IPPIS/PAY/2026/09
**Date:** October 10, 2026

#### 1.0 Attention: All Directors of Finance and Accounts (DFAs)
All Accounting Officers, Directors of Finance and Accounts, and Heads of Payroll Units in Federal MDAs are urged to adhere strictly to the monthly payroll computation calendar.

#### 2.0 Timelines for Processing:
- **10th of every month:** Deadline for submission of nominal roll changes, new appointments, and inter-cadre transfers.
- **15th of every month:** Cut-off for statutory deduction amendments, cooperative contributions, and tax adjustments.
- **18th of every month:** Closure of variance validation window and commencement of Central Payroll simulation runs.
- **22nd of every month:** Final Reviewer sign-off and dispatch of payment instructions to the Central Bank of Nigeria (CBN).

#### 3.0 Strict Adherence
Submissions received after the 15th will automatically roll over to the subsequent billing cycle. No manual adjustments outside the IPPIS centralized application will be entertained.
    `,
    category: "Payroll",
    refNumber: "OAGF/IPPIS/PAY/2026/09",
    date: "October 10, 2026",
    author: "Office of the Accountant-General of the Federation",
  },
  {
    id: "ann-03",
    title: "Enhanced Employee Self-Service (ESS) Portal: Electronic Payslip & Tax Clearance",
    summary:
      "Civil servants can now generate authenticated digital payslips with QR security verification and request automated tax compliance statements directly online.",
    content: `
### INTEGRATED PERSONNEL AND PAYROLL INFORMATION SYSTEM
**Department of Technical Operations and Information Security**
**Release Notice:** IPPIS-ESS-v4.2
**Date:** September 28, 2026

#### 1.0 Overview of New Capabilities
The IPPIS technical team has successfully deployed an upgraded Self-Service module featuring:
1. **Cryptographically Signed Payslips:** Every generated payslip now incorporates a tamper-evident QR verification code recognized by commercial banks and mortgage institutions.
2. **Tax Clearance & Annual Deduction Summaries:** Seamlessly export annual PAYE statements directly to your state internal revenue service.
3. **Automated Ticket Submission:** Report salary discrepancies, uncredited allowances, or loan deduction overages with instant tracking ID generation.

#### 2.0 How to Access
Login using your official staff credentials at the **Employee Portal** button on the top right navigation bar.
    `,
    category: "System Update",
    refNumber: "IPPIS/TECH/2026/REL-4.2",
    date: "September 28, 2026",
    author: "IPPIS Central ICT Operations",
  },
]

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<DisplayAnnouncement[]>(FALLBACK_ANNOUNCEMENTS)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<DisplayAnnouncement | null>(null)

  useEffect(() => {
    getAnnouncements()
      .then((res) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: DisplayAnnouncement[] = res.data.map((item: Announcement, idx: number) => ({
            id: item.id || `live-${idx}`,
            title: item.title,
            summary: item.content?.slice(0, 160) + "..." || "Official notification for federal employees.",
            content: item.content || "No detailed content provided.",
            category: (item.audience?.includes("Payroll") ? "Payroll" : "Notice") as any,
            date: item.publish_date ? new Date(item.publish_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent",
            author: item.company_code || "Federal Government of Nigeria",
          }))
          setAnnouncements([...mapped, ...FALLBACK_ANNOUNCEMENTS])
        }
      })
      .catch(() => {})
  }, [])

  const categories = ["All", "Circular", "Payroll", "Notice", "System Update"]

  const filtered = useMemo(() => {
    return announcements.filter((item) => {
      const matchCat = selectedCategory === "All" || item.category.toLowerCase() === selectedCategory.toLowerCase()
      const matchQuery =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.refNumber && item.refNumber.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchCat && matchQuery
    })
  }, [announcements, selectedCategory, searchQuery])

  const getCategoryBadge = (category: string) => {
    switch (category.toLowerCase()) {
      case "circular":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Official Circular</Badge>
      case "payroll":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Payroll Calendar</Badge>
      case "system update":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Portal Update</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{category}</Badge>
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50/50">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="container flex h-16 items-center justify-between py-4">
          <Link href="/" className="flex items-center">
            <div className="relative h-10 w-10 overflow-hidden rounded-md mr-2 border border-gray-200">
              <Image src="/images/ippis-logo.jpeg" alt="IPPIS Logo" width={40} height={40} className="object-contain" />
            </div>
            <span className="text-xl font-bold text-gray-900">IPPIS</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-emerald-700">
              Home
            </Link>
            <Link href="/announcements" className="text-sm font-bold text-[#008751] border-b-2 border-[#008751] pb-0.5">
              Announcements
            </Link>
            <Link href="/knowledge-base" className="text-sm font-medium text-gray-700 hover:text-emerald-700">
              Knowledge Base
            </Link>
            <Link href="/#tickets" className="text-sm font-medium text-gray-700 hover:text-emerald-700 flex items-center gap-1">
              <Ticket className="h-3.5 w-3.5" /> Support Tickets
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="outline" size="sm" className="text-xs">
                Log in
              </Button>
            </Link>
            <Link href="/portal">
              <Button size="sm" className="bg-[#008751] hover:bg-[#007545] text-white text-xs">
                Employee Portal
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Banner */}
      <section className="bg-gradient-to-b from-emerald-50 to-white border-b py-12 md:py-16">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
            <Megaphone className="h-3.5 w-3.5" />
            Official Federal Bulletins & Circulars
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            IPPIS Announcements Archive
          </h1>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
            Stay updated with official administrative guidelines, biometric enrollment circulars, and treasury processing notices.
          </p>

          <div className="relative max-w-2xl mx-auto pt-2">
            <Search className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search circulars by keyword, reference code, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 h-13 text-sm bg-white rounded-full shadow-sm border-gray-300 focus-visible:ring-emerald-600"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container px-4 md:px-6 py-10 flex-1 max-w-6xl mx-auto">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-emerald-700 flex items-center gap-1">
            <Home className="h-3.5 w-3.5" /> Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          <span className="font-semibold text-gray-800">Official Announcements</span>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 flex-wrap pb-6 border-b">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-4 py-2 rounded-full font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-[#008751] text-white shadow-xs"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Announcements List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {filtered.map((ann) => (
            <Card
              key={ann.id}
              className="flex flex-col justify-between border-gray-200 hover:border-emerald-400 hover:shadow-md transition-all bg-white"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  {getCategoryBadge(ann.category)}
                  <div className="flex items-center text-xs text-gray-500 font-mono">
                    <CalendarDays className="mr-1 h-3.5 w-3.5 text-gray-400" />
                    <span>{ann.date}</span>
                  </div>
                </div>
                <CardTitle className="text-base font-bold text-gray-900 line-clamp-2 leading-snug">
                  {ann.title}
                </CardTitle>
                {ann.refNumber && (
                  <span className="text-[11px] font-mono text-gray-400 block pt-0.5">
                    Ref: {ann.refNumber}
                  </span>
                )}
              </CardHeader>
              <CardContent className="pb-4 text-xs text-gray-600 leading-relaxed">
                <p className="line-clamp-3">{ann.summary}</p>
                <div className="mt-3 pt-3 border-t text-[11px] text-gray-500 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{ann.author}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAnnouncement(ann)}
                  className="w-full border-emerald-600 text-[#008751] hover:bg-emerald-50 hover:text-emerald-800 text-xs flex items-center justify-center gap-1.5 font-semibold"
                >
                  Read Full Notice
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      {/* Modal */}
      <Dialog open={!!selectedAnnouncement} onOpenChange={(open) => !open && setSelectedAnnouncement(null)}>
        {selectedAnnouncement && (
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                {getCategoryBadge(selectedAnnouncement.category)}
                <span className="text-xs text-gray-500 font-mono">{selectedAnnouncement.date}</span>
              </div>
              <DialogTitle className="text-lg font-bold text-gray-900 leading-snug">
                {selectedAnnouncement.title}
              </DialogTitle>
              {selectedAnnouncement.refNumber && (
                <DialogDescription className="font-mono text-xs text-emerald-700">
                  Official Gazette / Reference: {selectedAnnouncement.refNumber}
                </DialogDescription>
              )}
            </DialogHeader>

            <div className="space-y-4 py-2 border-t border-b my-2">
              <div className="p-3 bg-gray-50 rounded-lg text-xs space-y-1">
                <div className="font-semibold text-gray-800">Issuing Authority:</div>
                <div className="text-gray-600">{selectedAnnouncement.author}</div>
              </div>

              <div className="prose prose-sm max-w-none text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                {selectedAnnouncement.content}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" size="sm" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs">
                <Printer className="h-3.5 w-3.5" /> Print Notice
              </Button>
              <Button
                size="sm"
                className="bg-[#008751] hover:bg-[#007545] text-white text-xs"
                onClick={() => setSelectedAnnouncement(null)}
              >
                Close Notice
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <footer className="border-t bg-white py-6 text-center text-xs text-gray-500">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} Integrated Personnel and Payroll Information System (IPPIS). All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
