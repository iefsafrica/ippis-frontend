"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  BookOpen,
  Search,
  ThumbsUp,
  Eye,
  Tag,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  CheckCircle2,
  Ticket,
  FileQuestion,
  RefreshCw,
  AlertCircle,
  Calendar,
} from "lucide-react"
import { useGetKnowledgeBaseArticles } from "@/services/hooks/knowledgeBase"
import type { KnowledgeBaseArticle } from "@/types/knowledgeBase"

export default function KnowledgeBaseSection() {
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
              Official self-service guides, documentation, and answers for federal personnel verification, payslip inquiries, and service management.
            </p>
          </div>

          {/* Search Input */}
          <div className="w-full max-w-2xl relative pt-2">
            <Search className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search guides by keyword, topic, or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 h-12 text-sm rounded-full border-gray-300 shadow-xs focus-visible:ring-emerald-500"
            />
          </div>

          {/* Category Filter Pills (dynamic from API articles) */}
          {categories.length > 1 && (
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
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3 pt-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse border border-gray-200">
                <CardHeader className="space-y-3 pb-3">
                  <div className="h-4 w-28 bg-gray-200 rounded"></div>
                  <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent className="space-y-2 pb-4">
                  <div className="h-3 w-full bg-gray-200 rounded"></div>
                  <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
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
          <div className="mx-auto max-w-md pt-8 text-center">
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
          <div className="mx-auto max-w-md pt-8 text-center">
            <Card className="border border-dashed border-gray-300 bg-gray-50/50 p-8">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900 mb-1">No Articles Published</h3>
              <p className="text-sm text-gray-500 mb-4">
                {searchQuery
                  ? `No knowledge base articles matched your search "${searchQuery}".`
                  : "There are currently no knowledge base articles published. Please check back soon."}
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
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3 pt-8">
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
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pb-4">
                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                      {article.content}
                    </p>
                    {tagsList.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {tagsList.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                          >
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
                        Preview
                      </Button>
                      <Link href={`/knowledge-base/${article.kb_id || article.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-gray-600 hover:text-emerald-700 hover:bg-gray-100 px-1.5 h-7"
                          title="Open full page"
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

        {/* View All Guides Link */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/knowledge-base">
            <Button className="bg-[#008751] hover:bg-[#007043] text-white gap-2 font-medium">
              <BookOpen className="h-4 w-4" />
              Explore All Knowledge Base Articles
            </Button>
          </Link>
          <Link href="#tickets">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 gap-2 font-medium">
              <Ticket className="h-4 w-4 text-emerald-600" />
              Can&apos;t find an answer? Submit a Ticket
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Preview Modal */}
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
                      {selectedArticle.helpful} found this helpful
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
                    Open Full Page View
                  </Button>
                </Link>
                <Button size="sm" onClick={() => setSelectedArticle(null)} className="bg-emerald-700 hover:bg-emerald-800">
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
