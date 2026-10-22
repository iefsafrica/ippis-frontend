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
  RefreshCw,
  AlertCircle,
  Calendar,
} from "lucide-react"
import { useGetKnowledgeBaseArticles } from "@/services/hooks/knowledgeBase"
import type { KnowledgeBaseArticle } from "@/types/knowledgeBase"
import { toast } from "sonner"

export default function PublicKnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeBaseArticle | null>(null)

  const { data, isLoading, isError, refetch, isFetching } = useGetKnowledgeBaseArticles()

  const liveArticles: KnowledgeBaseArticle[] = useMemo(() => {
    const raw = (data as any)?.data?.articles || (data as any)?.data || (data as any)?.articles
    if (Array.isArray(raw)) {
      return raw
    }
    return []
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
      const matchCat =
        selectedCategory === "All" ||
        article.category?.toLowerCase() === selectedCategory.toLowerCase()
      const matchSearch =
        !searchQuery.trim() ||
        article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.kb_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchSearch
    })
  }, [liveArticles, selectedCategory, searchQuery])

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ""
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    } catch {
      return dateStr
    }
  }

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
            <Link href="/announcements" className="text-sm font-medium text-gray-700 hover:text-emerald-700 flex items-center gap-1.5">
              <Megaphone className="h-3.5 w-3.5 text-emerald-600" />
              Announcements
            </Link>
            <Link href="/knowledge-base" className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              Knowledge Base
            </Link>
            <Link href="/#tickets" className="text-sm font-medium text-gray-700 hover:text-emerald-700 flex items-center gap-1.5">
              <Ticket className="h-3.5 w-3.5 text-emerald-600" />
              Support Tickets
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/portal">
              <Button size="sm" className="bg-[#008751] hover:bg-[#007043] text-white">
                Employee Portal
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-emerald-900 to-emerald-800 text-white py-14 px-4 text-center">
        <div className="container max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-700/60 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-medium text-emerald-100">
            <BookOpen className="h-3.5 w-3.5" />
            Official Documentation & Help Articles
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            How can we help you today?
          </h1>
          <p className="text-emerald-100 text-sm md:text-base max-w-2xl mx-auto">
            Find official guidance, walkthroughs, and answers to common questions regarding IPPIS personnel verification, payroll processing, and self-service.
          </p>

          {/* Large Search Bar */}
          <div className="pt-4 max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search guides by title, category, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 pl-12 pr-4 rounded-full bg-white text-gray-900 shadow-lg text-sm border-0 focus-visible:ring-2 focus-visible:ring-emerald-400"
            />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container max-w-6xl mx-auto py-10 px-4 flex-1">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-emerald-700 flex items-center gap-1">
            <Home className="h-3.5 w-3.5" />
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-900 font-medium">Knowledge Base</span>
        </div>

        {/* Categories Bar */}
        {categories.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap mb-8 pb-3 border-b border-gray-200">
            <span className="text-xs font-semibold text-gray-500 mr-2">Topic Filters:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3.5 py-1.5 rounded-full transition-all font-medium ${
                  selectedCategory === cat
                    ? "bg-[#008751] text-white shadow-xs"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse border border-gray-200 bg-white">
                <CardHeader className="space-y-3 pb-3">
                  <div className="h-4 w-28 bg-gray-200 rounded"></div>
                  <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent className="space-y-2 pb-4">
                  <div className="h-3 w-full bg-gray-200 rounded"></div>
                  <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
                  <div className="h-3 w-2/3 bg-gray-200 rounded"></div>
                </CardContent>
                <CardFooter className="pt-2 border-t">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <div className="mx-auto max-w-md py-12 text-center">
            <Card className="border-red-200 bg-red-50/50 p-6">
              <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900 mb-1">Unable to Load Knowledge Base</h3>
              <p className="text-sm text-gray-600 mb-4">
                We had trouble fetching articles from the service.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="gap-2 border-red-200 hover:bg-red-100"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                Retry
              </Button>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredArticles.length === 0 && (
          <div className="mx-auto max-w-md py-12 text-center">
            <Card className="border border-dashed border-gray-300 bg-white p-8">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900 mb-1">No Articles Published</h3>
              <p className="text-sm text-gray-500 mb-4">
                {searchQuery
                  ? `No articles matched your search query "${searchQuery}".`
                  : "There are currently no knowledge base articles published. Please check back later."}
              </p>
              <div className="flex justify-center gap-2">
                {searchQuery && (
                  <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Articles Grid */}
        {!isLoading && !isError && filteredArticles.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => {
              const tagsList = article.tags
                ? article.tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                : []

              return (
                <Card
                  key={article.id || article.kb_id}
                  className="flex flex-col justify-between border border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md transition-all group"
                >
                  <CardHeader className="space-y-2 pb-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                        {article.category || "General"}
                      </span>
                      {article.kb_id && (
                        <span className="text-gray-400 font-mono text-[11px]">{article.kb_id}</span>
                      )}
                    </div>
                    <CardTitle className="text-base font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                      <Link href={`/knowledge-base/${article.kb_id || article.id}`}>
                        {article.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pb-4">
                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                      {article.content}
                    </p>
                    {tagsList.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {tagsList.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-3 border-t bg-gray-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {article.views !== undefined && article.views !== null && (
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3 text-gray-400" />
                          {article.views}
                        </span>
                      )}
                      {article.helpful !== undefined && article.helpful !== null && (
                        <span className="flex items-center gap-1 text-emerald-700 font-medium">
                          <ThumbsUp className="h-3 w-3" />
                          {article.helpful}
                        </span>
                      )}
                      {article.updated_at && (
                        <span className="text-[11px] text-gray-400">
                          {formatDate(article.updated_at)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedArticle(article)}
                        className="text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-2 h-7 font-medium"
                      >
                        Quick Read
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(article)}
                        className="text-xs text-gray-500 hover:text-gray-700 px-1.5 h-7"
                        title="Share link"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </Button>
                      <Link href={`/knowledge-base/${article.kb_id || article.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-1.5 h-7"
                          title="Open article page"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}

        {/* Bottom Help Desk CTA */}
        <section className="mt-16 rounded-2xl bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 border border-emerald-200 p-8 text-center space-y-4">
          <HelpCircle className="h-10 w-10 text-emerald-600 mx-auto" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Still need assistance with your IPPIS account?
          </h2>
          <p className="text-sm text-gray-600 max-w-xl mx-auto">
            If our documentation doesn&apos;t answer your question, our technical support and MDA payroll desk specialists are available to resolve your issues.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/#tickets">
              <Button className="bg-[#008751] hover:bg-[#007043] text-white gap-2 font-medium">
                <Ticket className="h-4 w-4" />
                Submit a Support Ticket
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-white font-medium">
                Log into Admin / Desk Officer Portal
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Quick Read Modal Dialog */}
      <Dialog open={Boolean(selectedArticle)} onOpenChange={(open) => !open && setSelectedArticle(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedArticle && (
            <>
              <DialogHeader className="space-y-3 border-b pb-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                    {selectedArticle.category || "General"}
                  </Badge>
                  {selectedArticle.kb_id && (
                    <span className="text-xs text-gray-400 font-mono">{selectedArticle.kb_id}</span>
                  )}
                </div>
                <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900 leading-snug">
                  {selectedArticle.title}
                </DialogTitle>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {selectedArticle.views !== undefined && (
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5 text-gray-400" />
                      {selectedArticle.views} views
                    </span>
                  )}
                  {selectedArticle.helpful !== undefined && (
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      {selectedArticle.helpful} found helpful
                    </span>
                  )}
                  {selectedArticle.updated_at && (
                    <span className="text-gray-400">
                      Updated: {formatDate(selectedArticle.updated_at)}
                    </span>
                  )}
                </div>
              </DialogHeader>

              <div className="py-4 text-sm text-gray-800 leading-relaxed whitespace-pre-line space-y-3">
                {selectedArticle.content}
              </div>

              <DialogFooter className="flex sm:justify-between items-center border-t pt-4 gap-2">
                <Link href={`/knowledge-base/${selectedArticle.kb_id || selectedArticle.id}`}>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open Dedicated Page
                  </Button>
                </Link>
                <Button size="sm" onClick={() => setSelectedArticle(null)} className="bg-emerald-700 hover:bg-emerald-800">
                  Close Preview
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
