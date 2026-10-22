"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CalendarDays, Bell, ArrowRight, ShieldAlert, FileText, Megaphone, CheckCircle2, Download, Printer } from "lucide-react"
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
  priority?: "urgent" | "normal"
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
    priority: "urgent",
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
    priority: "normal",
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
    priority: "normal",
  },
]

export default function NewsSection() {
  const [announcements, setAnnouncements] = useState<DisplayAnnouncement[]>(FALLBACK_ANNOUNCEMENTS)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<DisplayAnnouncement | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("All")

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
            priority: item.status === "published" ? "normal" : "urgent",
          }))
          setAnnouncements([...mapped, ...FALLBACK_ANNOUNCEMENTS])
        }
      })
      .catch(() => {
        // Fallback already pre-seeded
      })
  }, [])

  const categories = ["All", "Circular", "Payroll", "Notice", "System Update"]

  const filteredAnnouncements = useMemo(() => {
    if (selectedCategory === "All") return announcements
    return announcements.filter((a) => a.category.toLowerCase() === selectedCategory.toLowerCase())
  }, [announcements, selectedCategory])

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

  const handlePrint = () => {
    window.print()
  }

  return (
    <section id="announcements" data-section="news" className="w-full py-16 md:py-24 bg-gray-50/60 border-t border-b">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-semibold text-emerald-800">
              <Megaphone className="h-3.5 w-3.5" />
              Official Bulletins & Notices
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-gray-900">
              Latest IPPIS Announcements & Circulars
            </h2>
            <p className="max-w-[800px] text-gray-600 md:text-lg">
              Official circulars, nominal roll verification schedules, and policy updates issued by the Office of the Head of the Civil Service of the Federation and the Office of the Accountant-General.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap justify-center pt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3.5 py-1.5 rounded-full transition-all font-medium ${
                  selectedCategory === cat
                    ? "bg-[#008751] text-white shadow-xs"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Announcements Grid */}
        <div className="mx-auto grid max-w-6xl gap-6 py-10 md:grid-cols-2 lg:grid-cols-3">
          {filteredAnnouncements.slice(0, 6).map((ann) => (
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

        {/* View All & Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
          <Link href="/announcements">
            <Button className="bg-[#008751] hover:bg-[#007545] text-white text-xs px-6 font-semibold shadow-xs">
              View All Announcements Archive
            </Button>
          </Link>
          <Link href="#knowledge-base">
            <Button variant="outline" className="border-gray-300 text-gray-700 text-xs px-6">
              Browse Knowledge Base FAQs
            </Button>
          </Link>
        </div>
      </div>

      {/* Full Announcement View Modal */}
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
              <Button variant="outline" size="sm" onClick={handlePrint} className="flex items-center gap-1.5 text-xs">
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
    </section>
  )
}
