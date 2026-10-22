"use client"

import { useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  ChevronLeft,
  ChevronRight,
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
  Calendar,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGetKnowledgeBaseArticles } from "@/services/hooks/knowledgeBase"
import type { KnowledgeBaseArticle } from "@/types/knowledgeBase"
import { toast } from "sonner"

export default function PublicArticleDetailPage() {
  const params = useParams()
  const id = params?.id as string

  const { data, isLoading, isError, refetch, isFetching } = useGetKnowledgeBaseArticles()
  const [hasVoted, setHasVoted] = useState(false)
  const [helpfulCount, setHelpfulCount] = useState<number | null>(null)

  const articles: KnowledgeBaseArticle[] = useMemo(() => {
    const raw = (data as any)?.data?.articles || (data as any)?.data || (data as any)?.articles
    if (Array.isArray(raw)) {
      return raw
    }
    return []
  }, [data])

  const article: KnowledgeBaseArticle | undefined = useMemo(() => {
    if (!id || articles.length === 0) return undefined
    return articles.find((a) => a.kb_id === id || String(a.id) === id)
  }, [articles, id])

  const relatedArticles = useMemo(() => {
    if (!article) return []
    return articles
      .filter((a) => (a.kb_id !== article.kb_id && a.id !== article.id) && (a.category === article.category || !article.category))
      .slice(0, 3)
  }, [articles, article])

  const handleVote = (isHelpful: boolean) => {
    if (hasVoted) return
    setHasVoted(true)
    const base = helpfulCount ?? (article?.helpful || 0)
    setHelpfulCount(isHelpful ? base + 1 : base)
    toast.success("Feedback Received", {
      description: isHelpful
        ? "Thank you! We're glad this guide helped you."
        : "Thank you for the feedback. We will work to improve this guide.",
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShare = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link Copied", { description: "Article URL copied to your clipboard." })
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Recent"
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    } catch {
      return dateStr
    }
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/60 flex flex-col">
        <header className="border-b bg-white">
          <div className="container flex h-16 items-center justify-between py-4">
            <Link href="/" className="flex items-center">
              <div className="relative h-10 w-10 overflow-hidden rounded-md mr-2 border border-gray-200">
                <Image src="/images/ippis-logo.jpeg" alt="IPPIS Logo" width={40} height={40} className="object-contain" />
              </div>
              <span className="text-xl font-bold text-gray-900">IPPIS</span>
            </Link>
          </div>
        </header>
        <main className="container max-w-4xl mx-auto px-4 py-12 flex-1 animate-pulse">
          <div className="h-4 w-32 bg-gray-200 rounded mb-6"></div>
          <div className="h-8 w-3/4 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded mb-8"></div>
          <div className="space-y-3 bg-white p-8 rounded-xl border border-gray-200">
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
            <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-200 rounded pt-4"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
          </div>
        </main>
      </div>
    )
  }

  // Article not found
  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50/60 flex flex-col">
        <header className="border-b bg-white">
          <div className="container flex h-16 items-center justify-between py-4">
            <Link href="/" className="flex items-center">
              <div className="relative h-10 w-10 overflow-hidden rounded-md mr-2 border border-gray-200">
                <Image src="/images/ippis-logo.jpeg" alt="IPPIS Logo" width={40} height={40} className="object-contain" />
              </div>
              <span className="text-xl font-bold text-gray-900">IPPIS</span>
            </Link>
            <Link href="/knowledge-base">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                <ChevronLeft className="h-3.5 w-3.5" /> Back to Knowledge Base
              </Button>
            </Link>
          </div>
        </header>

        <main className="container max-w-md mx-auto px-4 py-16 flex-1 text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Article Not Found</h1>
          <p className="text-sm text-gray-600 mb-6">
            The article reference <code className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs">{id}</code> could not be found or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link href="/knowledge-base">
              <Button className="w-full sm:w-auto bg-[#008751] hover:bg-[#007043] text-white">
                Browse All Guides
              </Button>
            </Link>
            <Link href="/#tickets">
              <Button variant="outline" className="w-full sm:w-auto">
                Submit Support Ticket
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const tagsList = article.tags
    ? article.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : []

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
                  {article.kb_id && (
                    <span className="text-xs font-mono text-gray-400">Article Ref: {article.kb_id}</span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                  {article.title}
                </h1>
                <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap pt-1">
                  <span>Updated: {formatDate(article.updated_at || article.created_at)}</span>
                  {article.views !== undefined && article.views !== null && (
                    <>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {article.views} views
                      </span>
                    </>
                  )}
                  {article.helpful !== undefined && article.helpful !== null && (
                    <>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3 text-emerald-600" /> {helpfulCount ?? article.helpful} helpful
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Formatted Article Content */}
              <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed text-sm whitespace-pre-line">
                {article.content}
              </div>

              {/* Tags */}
              {tagsList.length > 0 && (
                <div className="pt-4 border-t flex items-center gap-2 flex-wrap">
                  <Tag className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500 mr-1">Tags:</span>
                  {tagsList.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs font-normal bg-gray-100 text-gray-700">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Action Toolbar */}
              <div className="pt-4 border-t flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs text-gray-600">
                    <Printer className="h-3.5 w-3.5" /> Print Guide
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5 text-xs text-gray-600">
                    <Share2 className="h-3.5 w-3.5" /> Share
                  </Button>
                </div>
              </div>

              {/* Helpful Rating Widget */}
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-5 text-center space-y-3">
                <p className="text-sm font-semibold text-gray-900">Was this article helpful to you?</p>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    size="sm"
                    variant={hasVoted ? "secondary" : "outline"}
                    disabled={hasVoted}
                    onClick={() => handleVote(true)}
                    className="gap-1.5 text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" /> Yes, it helped
                  </Button>
                  <Button
                    size="sm"
                    variant={hasVoted ? "secondary" : "outline"}
                    disabled={hasVoted}
                    onClick={() => handleVote(false)}
                    className="text-xs text-gray-600 hover:bg-gray-100"
                  >
                    No, I need more help
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-gray-200 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-gray-900">Need Individual Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-gray-600">
                <p>
                  If you are experiencing salary stoppage, verification lockout, or deduction errors that cannot be resolved via documentation:
                </p>
                <Link href="/#tickets" className="block w-full">
                  <Button className="w-full bg-[#008751] hover:bg-[#007043] text-white text-xs gap-1.5">
                    <Ticket className="h-3.5 w-3.5" /> Submit Support Ticket
                  </Button>
                </Link>
                <Link href="/knowledge-base" className="block w-full">
                  <Button variant="outline" className="w-full text-xs">
                    Browse All Knowledge Base
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <Card className="border-gray-200 shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-gray-900">Related Articles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {relatedArticles.map((rel) => (
                    <Link
                      key={rel.kb_id || rel.id}
                      href={`/knowledge-base/${rel.kb_id || rel.id}`}
                      className="block p-2.5 rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/40 transition-all text-xs"
                    >
                      <p className="font-semibold text-gray-800 line-clamp-2 hover:text-emerald-700">
                        {rel.title}
                      </p>
                      <span className="text-[11px] text-gray-400 mt-1 block">
                        {rel.category || "General"}
                      </span>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
