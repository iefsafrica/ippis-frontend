"use client"

import { useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Tag,
  ThumbsUp,
  Printer,
  Share2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Home,
  Ticket,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
]

export default function PublicArticlePage() {
  const params = useParams()
  const articleId = params?.id as string

  const { data } = useGetKnowledgeBaseArticles()
  const [helpfulFeedback, setHelpfulFeedback] = useState<boolean | null>(null)

  const articles: KnowledgeBaseArticle[] = useMemo(() => {
    const raw = (data as any)?.data?.articles
    if (Array.isArray(raw) && raw.length > 0) return raw
    return FALLBACK_KB_ARTICLES
  }, [data])

  const article: KnowledgeBaseArticle | null = useMemo(() => {
    if (!articleId) return null
    return (
      articles.find(
        (a: KnowledgeBaseArticle) =>
          String(a.id) === String(articleId) ||
          String(a.kb_id).toLowerCase() === String(articleId).toLowerCase()
      ) ?? null
    )
  }, [articles, articleId])

  const relatedArticles: KnowledgeBaseArticle[] = useMemo(() => {
    if (!article) return []
    return articles
      .filter((a: KnowledgeBaseArticle) => a.id !== article.id && a.category === article.category)
      .slice(0, 3)
  }, [articles, article])

  const handleShare = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link Copied", { description: "Article link copied to clipboard." })
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="border-b bg-white py-4">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <Link href="/knowledge-base" className="flex items-center gap-2">
              <span className="font-bold text-gray-900">IPPIS Knowledge Base</span>
            </Link>
          </div>
        </header>

        <main className="container mx-auto py-16 px-4 max-w-xl text-center flex-1">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
            <h2 className="text-xl font-bold text-gray-900">Article Not Found</h2>
            <p className="text-xs text-gray-500">
              The requested guide with reference &quot;{articleId}&quot; could not be found or may have been updated.
            </p>
            <Link href="/knowledge-base">
              <Button className="bg-[#008751] hover:bg-[#007545] text-xs">
                Back to Knowledge Base
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/60 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="container flex h-16 items-center justify-between py-4">
          <Link href="/" className="flex items-center">
            <div className="relative h-10 w-10 overflow-hidden rounded-md mr-2 border border-gray-200">
              <Image src="/images/ippis-logo.jpeg" alt="IPPIS Logo" width={40} height={40} className="object-contain" />
            </div>
            <span className="text-xl font-bold text-gray-900">IPPIS</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/knowledge-base">
              <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1 text-gray-700">
                <ChevronLeft className="h-3.5 w-3.5" /> All Guides
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

      {/* Main Container */}
      <main className="container max-w-5xl mx-auto px-4 py-8 flex-1">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-6 flex-wrap">
          <Link href="/" className="hover:text-emerald-700 flex items-center gap-1">
            <Home className="h-3.5 w-3.5" /> Home
          </Link>
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <Link href="/knowledge-base" className="hover:text-emerald-700">
            Knowledge Base
          </Link>
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <span className="font-semibold text-gray-800 truncate max-w-xs">{article.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Article Body */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs space-y-6">
              <div className="space-y-3 pb-6 border-b">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-800 border-emerald-200 font-medium">
                    {article.category || "General Guide"}
                  </Badge>
                  <span className="text-xs font-mono text-gray-400">Article Ref: {article.kb_id}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                  {article.title}
                </h1>
                <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap pt-1">
                  <span>Updated: {new Date(article.updated_at || Date.now()).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {article.views || 0} views</span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3 text-emerald-600" /> {article.helpful || 0} helpful</span>
                </div>
              </div>

              {/* Formatted Article Content */}
              <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed text-sm whitespace-pre-line">
                {article.content}
              </div>

              {/* Tags */}
              {article.tags && (
                <div className="pt-4 border-t flex items-center gap-2 flex-wrap">
                  <Tag className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs text-gray-400 font-medium">Tags:</span>
                  {article.tags.split(",").map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[11px] bg-gray-100 text-gray-600">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Action Bar (Share, Print, Feedback) */}
              <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 font-medium">Was this guide helpful?</span>
                  <Button
                    variant={helpfulFeedback === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setHelpfulFeedback(true)
                      toast.success("Thank you for your feedback!")
                    }}
                    className={`h-8 text-xs ${helpfulFeedback === true ? "bg-[#008751] text-white" : ""}`}
                  >
                    <ThumbsUp className="h-3.5 w-3.5 mr-1" /> Yes
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleShare} className="h-8 text-xs flex items-center gap-1">
                    <Share2 className="h-3.5 w-3.5" /> Share
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrint} className="h-8 text-xs flex items-center gap-1">
                    <Printer className="h-3.5 w-3.5" /> Print Guide
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Need Direct Assistance Card */}
            <Card className="border-gray-200 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-900">
                  <HelpCircle className="h-4 w-4 text-emerald-600" />
                  Need Direct Support?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-gray-600 space-y-3 pb-4">
                <p>
                  If your issue involves uncredited salary, biometric scheduling discrepancies, or bank returns, submit an official support ticket.
                </p>
                <Link href="/#tickets">
                  <Button className="w-full bg-[#008751] hover:bg-[#007545] text-white text-xs flex items-center justify-center gap-1.5">
                    <Ticket className="h-3.5 w-3.5" />
                    Submit Support Ticket
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <Card className="border-gray-200 bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-gray-900">Related Knowledge Articles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pb-4">
                  {relatedArticles.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/knowledge-base/${rel.kb_id || rel.id}`}
                      className="block p-2.5 rounded-lg border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all text-xs"
                    >
                      <span className="font-semibold text-gray-800 line-clamp-2 leading-snug">
                        {rel.title}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono mt-1 block">
                        {rel.kb_id} &bull; {rel.views || 0} reads
                      </span>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t bg-white py-6 text-center text-xs text-gray-500 mt-10">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} Integrated Personnel and Payroll Information System (IPPIS). All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
