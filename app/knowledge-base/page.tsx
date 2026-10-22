"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  BookOpen,
  Search,
  ChevronRight,
  ThumbsUp,
  Eye,
  Tag,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Ticket,
  FileQuestion,
  Home,
  Megaphone,
  Printer,
  Share2,
} from "lucide-react"
import { useGetKnowledgeBaseArticles } from "@/services/hooks/knowledgeBase"
import type { KnowledgeBaseArticle } from "@/types/knowledgeBase"
import { toast } from "sonner"

const FALLBACK_KB_ARTICLES: KnowledgeBaseArticle[] = [
  {
    id: 1,
    kb_id: "KB-VER-101",
    title: "How to Complete IPPIS Physical & Biometric Employee Verification",
    category: "Employee Verification",
    tags: "verification,biometrics,audit,onboarding,documents",
    views: 1420,
    helpful: 388,
    comments: 42,
    created_at: "2026-09-12T00:00:00Z",
    updated_at: "2026-10-18T00:00:00Z",
    content: `
### Overview
The IPPIS Physical and Biometric Verification process is mandatory for all personnel on the federal payroll. This guide outlines every step needed to verify your account without administrative delay.

### Prerequisites Before Attending
1. **Verification Slip:** Generated from your MDA HR desk or downloaded via the Employee Portal.
2. **National Identity Number (NIN):** Must match the exact name spelling on your IPPIS staff record.
3. **Primary Documents:**
   - Original Letter of First Appointment
   - Letter of Confirmation of Appointment
   - Latest Promotion Letter or Gazette Notice
   - Highest Educational / Professional Credentials
   - Current MDA Staff Identity Card

### Step-by-Step Procedure at the Verification Center
1. **Screening & Document Presentation:** Present your document bundle to the MDA Verification Desk Officer for credential verification.
2. **Biometric Capture:** Place your left and right thumbs and index fingers on the optical biometric scanner.
3. **High-Resolution Facial Imaging:** Ensure proper illumination and remove caps or tinted glasses.
4. **Data Cross-Check:** Confirm your date of birth, date of first appointment, grade level, and step on the operator's display.
5. **Issuance of Clean Clearance Slip:** Collect and safeguard your stamped Biometric Verification Certificate.
    `,
  },
  {
    id: 2,
    kb_id: "KB-PAY-204",
    title: "Understanding PAYE Tax, Pension & Statutory Deductions on Your IPPIS Payslip",
    category: "Payroll & Payslips",
    tags: "payslip,deductions,tax,pension,nhf,salary",
    views: 2190,
    helpful: 512,
    comments: 67,
    created_at: "2026-08-20T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
    content: `
### Anatomy of Your Monthly IPPIS Payslip
Your monthly remuneration consists of Consolidated Public Service Salary (CONPSS) or relevant specialized salary scale components, along with statutory deductions.

### Breakdown of Standard Deductions
1. **PAYE (Pay-As-You-Earn):** Computed according to the Personal Income Tax Act (PITA) statutory brackets after consolidated relief allowances (CRA).
2. **Contributory Pension Scheme (CPS):** 8% employee contribution deducted monthly and remitted directly to your Pension Fund Administrator (PFA).
3. **National Housing Fund (NHF):** 2.5% of basic salary remitted to the Federal Mortgage Bank of Nigeria (FMBN).
4. **National Health Insurance Scheme (NHIS):** Health insurance coverage contributions.
5. **Voluntary Deductions:** MDA Staff Cooperative Thrift, Union Dues, and approved bank loans.

### Reporting Unauthorized Deductions
If you detect an unauthorized loan deduction or loan over-recovery, submit a ticket immediately under the **Payroll & Deductions** category with your payslip attached.
    `,
  },
  {
    id: 3,
    kb_id: "KB-BNK-302",
    title: "Updating Salary Bank Account Details & Resolving BVN/NIN Mismatches",
    category: "Bank & BVN Records",
    tags: "bvn,nin,bank,account,remittance,failed payment",
    views: 1870,
    helpful: 420,
    comments: 31,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-10-19T00:00:00Z",
    content: `
### When to Update Your Bank Details
Changes to bank account details arise when migrating accounts, addressing bank mergers, or correcting dormant account issues that cause salary return notices from the Central Bank.

### Requirements for Account Change
- Formal Application Letter endorsed by your MDA Director of Human Resources / Administration.
- Bank Confirmation Letter / Statement carrying official bank branch stamp.
- BVN Enrolment Slip matching your IPPIS registered full name and date of birth.
- Sworn Affidavit of Name Confirmation (if minor name arrangement differences exist).

### Submission Flow
Take the certified documentation to your MDA Payroll Desk Officer. The update requires Dual-Signoff (Approval and Reviewer endorsement, followed by Final Reviewer audit sign-off) to ensure treasury security.
    `,
  },
  {
    id: 4,
    kb_id: "KB-ESS-401",
    title: "Accessing the Employee Self-Service (ESS) Portal for Payslips & Requests",
    category: "Self-Service Portal",
    tags: "portal,login,password,payslip download,profile",
    views: 3100,
    helpful: 890,
    comments: 95,
    created_at: "2026-07-15T00:00:00Z",
    updated_at: "2026-10-12T00:00:00Z",
    content: `
### Getting Started with Employee Self-Service
Every federal employee provisioned on IPPIS has access to the self-service web portal for instant payslip generation, leave tracking, and profile verification.

### How to Login
1. Click **Employee Portal** at the top right of the IPPIS homepage.
2. Enter your **Staff ID** (e.g. IPPIS-104928) or registered official email.
3. Enter your temporary password or secure personal password.
4. If accessing for the first time, you will be prompted to set up a new password and configure two-factor authentication (SMS/Email OTP).

### Key Features Available
- **Instant Payslip Download:** Download PDF copies of payslips from the last 24 months.
- **Service Records Review:** Confirm your current grade level, step, cadre, and department.
- **Support Ticket Submission:** Open direct queries with the IPPIS help desk.
    `,
  },
  {
    id: 5,
    kb_id: "KB-LVE-505",
    title: "Submitting Annual, Maternity & Study Leave Applications Online",
    category: "Core HR & Leaves",
    tags: "leave,annual leave,maternity,study leave,approvals",
    views: 1250,
    helpful: 298,
    comments: 18,
    created_at: "2026-08-10T00:00:00Z",
    updated_at: "2026-10-05T00:00:00Z",
    content: `
### Guidelines for Online Leave Processing
Leave requests in the federal civil service are governed by Public Service Rules (PSR) Chapter 10. The IPPIS Core HR module allows digital submission and tiered supervisory routing.

### Step-by-Step Submission:
1. Log into your Employee Portal account.
2. Navigate to **My HR > Leave Applications > New Request**.
3. Select the leave category (Annual Leave, Casual Leave, Maternity Leave, Paternity Leave, or Study Leave).
4. Select the start date and resumption date. The system automatically computes your public holiday deductions and remaining leave balance.
5. Upload supporting medical reports or academic admission letters where applicable.
6. Submit for automated routing to your Sectional Head and Departmental Approver.
    `,
  },
  {
    id: 6,
    kb_id: "KB-SUP-601",
    title: "How to Track Your IPPIS Support Ticket and Communicate with Agents",
    category: "Support & Help Desk",
    tags: "tickets,support,helpdesk,tracking,resolution",
    views: 2450,
    helpful: 610,
    comments: 54,
    created_at: "2026-09-05T00:00:00Z",
    updated_at: "2026-10-20T00:00:00Z",
    content: `
### Tracking Ticket Status
Whenever you submit a query via the Support Ticket system, you are issued an alphanumeric Ticket Tracking Number (e.g., TKT-2026-89421).

### Checking Real-Time Resolution Status
1. On the landing page or portal, navigate to the **Support Tickets** section.
2. Select the **Track Ticket** tab.
3. Input your **Ticket Number** and registered **Official Email Address**.
4. Click **Track Status**.

### Resolution Lifecycle:
- **Pending Review:** Ticket received by central queue and assigned to an MDA desk specialist.
- **In Investigation:** Officer is reviewing nominal roll or payroll ledger details.
- **Action Required:** The agent requires additional documents or verification slips from you.
- **Resolved / Closed:** Remediation applied and circular reference or payment adjustment recorded.
    `,
  },
]

export default function PublicKnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeBaseArticle | null>(null)

  const { data, isLoading } = useGetKnowledgeBaseArticles()

  const liveArticles: KnowledgeBaseArticle[] = useMemo(() => {
    const raw = (data as any)?.data?.articles
    if (Array.isArray(raw) && raw.length > 0) {
      return raw
    }
    return FALLBACK_KB_ARTICLES
  }, [data])

  const categories = useMemo(() => {
    const set = new Set<string>()
    set.add("All")
    liveArticles.forEach((a) => {
      if (a.category) set.add(a.category)
    })
    return Array.from(set)
  }, [liveArticles])

  const filteredArticles = useMemo(() => {
    return liveArticles.filter((article) => {
      const matchCat = selectedCategory === "All" || article.category?.toLowerCase() === selectedCategory.toLowerCase()
      const matchSearch =
        !searchQuery.trim() ||
        article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.kb_id?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchSearch
    })
  }, [liveArticles, selectedCategory, searchQuery])

  const handleShare = (article: KnowledgeBaseArticle) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/knowledge-base/${article.kb_id || article.id}`)
      toast.success("Link Copied", { description: "Article link copied to clipboard." })
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50/50">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <div className="relative h-10 w-10 overflow-hidden rounded-md mr-2 border border-gray-200">
                <Image src="/images/ippis-logo.jpeg" alt="IPPIS Logo" width={40} height={40} className="object-contain" />
              </div>
              <span className="text-xl font-bold text-gray-900">IPPIS</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-emerald-700">
              Home
            </Link>
            <Link href="/#announcements" className="text-sm font-medium text-gray-700 hover:text-emerald-700 flex items-center gap-1">
              <Megaphone className="h-3.5 w-3.5" /> Announcements
            </Link>
            <Link href="/knowledge-base" className="text-sm font-bold text-[#008751] border-b-2 border-[#008751] pb-0.5">
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

      {/* Hero Banner with Search */}
      <section className="bg-gradient-to-b from-emerald-50 to-white border-b py-12 md:py-16">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
            <BookOpen className="h-3.5 w-3.5" />
            Official Help Center & Knowledge Base
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            How can we assist you today?
          </h1>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
            Search verified guidelines on payroll calculation, biometric audit schedules, bank change authorizations, and employee portal self-service.
          </p>

          {/* Large Search Bar */}
          <div className="relative max-w-2xl mx-auto pt-2">
            <Search className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by topic, keyword, or document ID (e.g. payslip, biometric, bvn, leave)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 h-13 text-sm bg-white rounded-full shadow-sm border-gray-300 focus-visible:ring-emerald-600"
            />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container px-4 md:px-6 py-10 flex-1 max-w-6xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-emerald-700 flex items-center gap-1">
            <Home className="h-3.5 w-3.5" /> Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          <span className="font-semibold text-gray-800">Knowledge Base Library</span>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap pb-8 border-b">
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

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {filteredArticles.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-xl border border-dashed border-gray-200 p-8">
              <FileQuestion className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-800">No matching articles found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                No guides matched &quot;{searchQuery}&quot;. Try broader terms or select another category.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("All")
                }}
                className="mt-4 text-xs"
              >
                Reset Search
              </Button>
            </div>
          ) : (
            filteredArticles.map((article) => (
              <Card
                key={article.id || article.kb_id}
                className="flex flex-col justify-between border-gray-200 hover:border-emerald-400 hover:shadow-md transition-all bg-white"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="outline" className="text-[11px] bg-emerald-50 text-emerald-800 border-emerald-200 font-medium">
                      {article.category || "General Guide"}
                    </Badge>
                    <span className="text-[11px] font-mono text-gray-400">{article.kb_id}</span>
                  </div>
                  <CardTitle className="text-base font-bold text-gray-900 line-clamp-2 leading-snug">
                    {article.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="pb-3 text-xs text-gray-600 leading-relaxed">
                  <p className="line-clamp-3">
                    {article.content.replace(/#|\*|`/g, "").slice(0, 160)}...
                  </p>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {article.views || 120} views
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3 text-emerald-600" /> {article.helpful || 45} helpful
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="pt-0 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedArticle(article)}
                    className="flex-1 border-gray-200 text-[#008751] hover:bg-emerald-50 hover:border-emerald-500 text-xs flex items-center justify-center gap-1.5 font-semibold"
                  >
                    Read Guide
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleShare(article)}
                    title="Copy Article Link"
                    className="h-8 w-8 text-gray-400 hover:text-gray-700"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        {/* Support Ticket Referral Card */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl font-bold">Could not find what you were looking for?</h3>
            <p className="text-emerald-100 text-xs sm:text-sm max-w-xl">
              Our central support desk team is on standby to assist with missing payments, biometric scheduling, or credential updates.
            </p>
          </div>
          <Link href="/#tickets">
            <Button className="bg-white text-emerald-900 hover:bg-emerald-50 font-semibold text-xs px-6 py-2.5 shrink-0 shadow-sm flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Open Support Ticket
            </Button>
          </Link>
        </div>
      </main>

      {/* Article Quick-Reader Modal */}
      <Dialog open={!!selectedArticle} onOpenChange={(open) => !open && setSelectedArticle(null)}>
        {selectedArticle && (
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-emerald-800 bg-emerald-50 border-emerald-200 text-xs">
                  {selectedArticle.category || "General"}
                </Badge>
                <span className="text-xs text-gray-400 font-mono">ID: {selectedArticle.kb_id}</span>
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900 leading-snug">
                {selectedArticle.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 flex items-center gap-3 pt-1">
                <span>Updated: {new Date(selectedArticle.updated_at || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                <span>&bull;</span>
                <span>{selectedArticle.views || 0} total reads</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3 border-t border-b my-2">
              <div className="prose prose-sm max-w-none text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                {selectedArticle.content}
              </div>

              {selectedArticle.tags && (
                <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t">
                  <Tag className="h-3.5 w-3.5 text-gray-400 mr-1" />
                  {selectedArticle.tags.split(",").map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px] bg-gray-100 text-gray-600">
                      {t.trim()}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <HelpCircle className="h-4 w-4 text-emerald-600" />
                <span>Was this guide helpful?</span>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-emerald-700 hover:bg-emerald-50">
                  Yes ({selectedArticle.helpful || 0})
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/knowledge-base/${selectedArticle.kb_id || selectedArticle.id}`}>
                  <Button variant="outline" size="sm" className="text-xs flex items-center gap-1">
                    Full Page View <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
                <Button
                  size="sm"
                  className="bg-[#008751] hover:bg-[#007545] text-white text-xs"
                  onClick={() => setSelectedArticle(null)}
                >
                  Close
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Footer */}
      <footer className="border-t bg-white py-8 text-center text-xs text-gray-500">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} Integrated Personnel and Payroll Information System (IPPIS). Office of the Accountant-General of the Federation.</p>
        </div>
      </footer>
    </div>
  )
}
