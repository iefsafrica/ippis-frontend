"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BookOpen, Search, ThumbsUp, Eye, Tag, ArrowRight, ExternalLink, HelpCircle, CheckCircle2, Ticket, FileQuestion } from "lucide-react"
import { useGetKnowledgeBaseArticles } from "@/services/hooks/knowledgeBase"
import type { KnowledgeBaseArticle } from "@/types/knowledgeBase"

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

export default function KnowledgeBaseSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeBaseArticle | null>(null)

  const { data } = useGetKnowledgeBaseArticles()

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

  return (
    <section id="knowledge-base" className="w-full py-16 md:py-24 bg-white border-b">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-semibold text-emerald-800">
              <BookOpen className="h-3.5 w-3.5" />
              Self-Service Help & Documentation
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-gray-900">
              IPPIS Knowledge Base & Civil Service Guides
            </h2>
            <p className="max-w-[800px] text-gray-600 md:text-lg">
              Instant answers, step-by-step walkthroughs, and solutions for payroll verification, payslip generation, allowance inquiries, and account self-service.
            </p>
          </div>

          {/* Search Input */}
          <div className="w-full max-w-2xl relative pt-2">
            <Search className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search guides by keyword, topic, or code (e.g. payslip, verification, deductions, BVN)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 h-12 text-sm rounded-full border-gray-300 shadow-xs focus-visible:ring-emerald-500"
            />
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
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="mx-auto grid max-w-6xl gap-6 py-10 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 p-8">
              <FileQuestion className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-gray-800">No matching guides found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                We couldn&apos;t find any articles matching &quot;{searchQuery}&quot;. Try adjusting your keywords or browse all categories.
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
                Reset Search Filters
              </Button>
            </div>
          ) : (
            filteredArticles.slice(0, 6).map((article) => (
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

                <CardFooter className="pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedArticle(article)}
                    className="w-full border-gray-200 text-[#008751] hover:bg-emerald-50 hover:border-emerald-500 text-xs flex items-center justify-center gap-1.5 font-semibold"
                  >
                    Read Guide
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        {/* Knowledge Base CTA Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
          <Link href="/knowledge-base">
            <Button className="bg-[#008751] hover:bg-[#007545] text-white text-xs px-6 font-semibold shadow-xs">
              Explore Full Knowledge Base Library
            </Button>
          </Link>
          <Link href="#tickets">
            <Button variant="outline" className="border-gray-300 text-gray-700 text-xs px-6 flex items-center gap-1.5">
              <Ticket className="h-3.5 w-3.5 text-emerald-700" />
              Still Need Help? Open a Support Ticket
            </Button>
          </Link>
        </div>
      </div>

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
    </section>
  )
}
